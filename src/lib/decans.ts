// Planetary Decans - Traditional system dividing each sign into three 10° sections
// Each decan is ruled by a planet based on the triplicity (element) rulership

export interface Decan {
  number: 1 | 2 | 3;
  degrees: string;
  ruler: string;
  rulerSymbol: string;
  quality: string;
  description: string;
}

// Element triplicities and their sign order
const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];

// Traditional planetary rulers for each sign
const SIGN_RULERS: Record<string, { planet: string; symbol: string }> = {
  Aries: { planet: 'Mars', symbol: '♂' },
  Taurus: { planet: 'Venus', symbol: '♀' },
  Gemini: { planet: 'Mercury', symbol: '☿' },
  Cancer: { planet: 'Moon', symbol: '☽' },
  Leo: { planet: 'Sun', symbol: '☉' },
  Virgo: { planet: 'Mercury', symbol: '☿' },
  Libra: { planet: 'Venus', symbol: '♀' },
  Scorpio: { planet: 'Pluto', symbol: '♇' }, // Modern; traditional is Mars
  Sagittarius: { planet: 'Jupiter', symbol: '♃' },
  Capricorn: { planet: 'Saturn', symbol: '♄' },
  Aquarius: { planet: 'Uranus', symbol: '♅' }, // Modern; traditional is Saturn
  Pisces: { planet: 'Neptune', symbol: '♆' }, // Modern; traditional is Jupiter
};

// Get the triplicity (element group) for a sign
const getTriplicity = (sign: string): string[] => {
  if (FIRE_SIGNS.includes(sign)) return FIRE_SIGNS;
  if (EARTH_SIGNS.includes(sign)) return EARTH_SIGNS;
  if (AIR_SIGNS.includes(sign)) return AIR_SIGNS;
  if (WATER_SIGNS.includes(sign)) return WATER_SIGNS;
  return [sign, sign, sign];
};

// Decan qualities based on position
const DECAN_QUALITIES: Record<1 | 2 | 3, string> = {
  1: 'Cardinal/Initiating',
  2: 'Fixed/Stabilizing',
  3: 'Mutable/Adapting',
};

// Detailed decan descriptions - EDUCATIONAL: explains the teaching behind why this decan works this way
const DECAN_DESCRIPTIONS: Record<string, Record<1 | 2 | 3, string>> = {
  Aries: {
    1: 'The 1st decan of any sign is ruled by the sign itself—here, Mars rules Mars. This is Aries at its purest: raw initiative, the first spark of action, the warrior unfiltered. Think of the very first moment of spring—pure, urgent, unstoppable.',
    2: 'The 2nd decan follows the elemental family: Fire signs go Aries → Leo → Sagittarius. So here, the Sun (Leo\'s ruler) adds warmth to Mars\' drive. The warrior gains a heart, fights for something they love, leads with creative courage rather than just raw force.',
    3: 'The 3rd decan completes the fire triplicity with Jupiter (Sagittarius\' ruler). The warrior becomes a philosopher—still bold, but now seeking meaning. Action serves a higher purpose. This is the crusader, the pioneer who fights for a vision.',
  },
  Taurus: {
    1: 'Venus rules Venus here—Taurus at its essential nature. This is the primordial earth experience: sensory pleasure, patient accumulation, the body\'s wisdom. Like seeds in rich soil, growth is slow but certain.',
    2: 'The 2nd decan brings Mercury (Virgo\'s ruler) into Venusian territory. The pleasure-seeker becomes discerning—not just any beauty, but refined taste. Values become practical, pleasures become healthy, the body serves a purpose.',
    3: 'Saturn (Capricorn\'s ruler) concludes the earth journey. What was sensual becomes structural. The builder emerges—one who turns pleasures into assets, values into legacy. Material mastery with long-term vision.',
  },
  Gemini: {
    1: 'Mercury rules Mercury—the mind at its most mercurial. This is pure curiosity, the child asking "why?" endlessly. Information gathering without judgment, the joy of learning for its own sake. Quick, restless, endlessly fascinated.',
    2: 'Venus (Libra\'s ruler) refines Mercury\'s chatter. Ideas become conversations, curiosity becomes diplomacy. The messenger learns to listen, to share thoughts beautifully, to find truth through dialogue rather than monologue.',
    3: 'Uranus/Saturn (Aquarius\' rulers) electrify the mind. Thoughts break convention, ideas leap ahead of their time. The curious student becomes the visionary inventor—still gathering information, but now synthesizing it into innovation.',
  },
  Cancer: {
    1: 'The Moon rules the Moon—emotions in their purest form. This is the primal mother, the protective shell, feelings as deep as the ocean. Nurturing comes instinctively, security is built through emotional bonds.',
    2: 'Pluto/Mars (Scorpio\'s rulers) deepen Cancer\'s waters. Nurturing becomes transformative, protection becomes fierce power. Emotions here don\'t just feel—they change you. Love is intense, bonds are unbreakable.',
    3: 'Neptune/Jupiter (Pisces\' rulers) dissolve boundaries. The nurturer becomes the mystic—caring extends to all beings, intuition guides protection. Compassion here is oceanic, sacrifice is spiritual, love is transcendent.',
  },
  Leo: {
    1: 'The Sun rules the Sun—creative fire in its purest glory. This is the child at play, the artist who creates for joy, the king who leads through radiance. Self-expression is natural, confidence is unlearned.',
    2: 'Jupiter (Sagittarius\' ruler) expands the Sun\'s warmth. Creativity becomes teaching, leadership becomes inspiration. The performer gains wisdom—not just shining, but illuminating others\' paths.',
    3: 'Mars (Aries\' ruler) ignites Leo\'s final degrees. Creative fire becomes action, expression becomes courage. The artist becomes the pioneer—one who doesn\'t just shine but blazes new trails.',
  },
  Virgo: {
    1: 'Mercury rules Mercury in earth—analysis meets service. This is the healer\'s precise hands, the craftsman\'s discerning eye. Order creates wellness, details matter because they serve the whole.',
    2: 'Saturn (Capricorn\'s ruler) structures Mercury\'s analysis. The helper becomes the master—skills refined over time, service becomes achievement. Discipline transforms talent into expertise.',
    3: 'Venus (Taurus\' ruler) grounds Virgo\'s work. Service finds pleasure, analysis appreciates beauty. The perfectionist learns to enjoy the process, craftsmanship becomes art, health becomes sensuality.',
  },
  Libra: {
    1: 'Venus rules Venus in air—beauty meets balance. This is pure aesthetic sense, the artist\'s eye, the diplomat\'s grace. Relationship is the teacher, harmony the goal, fairness the method.',
    2: 'Uranus/Saturn (Aquarius\' rulers) awaken Libra\'s ideals. Partnership serves humanity, beauty becomes activism. Relationships here aren\'t just personal—they model how society could be.',
    3: 'Mercury (Gemini\'s ruler) brings words to Libra\'s balance. The diplomat becomes the communicator—not just feeling harmony, but articulating it. Ideas connect people, conversation builds bridges.',
  },
  Scorpio: {
    1: 'Pluto/Mars rule the depths—transformation at its most intense. This is the alchemist\'s fire, the therapist\'s penetrating gaze. Nothing is surface, everything is investigated, death becomes rebirth.',
    2: 'Neptune/Jupiter (Pisces\' rulers) spiritualize Scorpio\'s power. Transformation becomes transcendence, depth becomes surrender. The investigator finds that the deepest truth is beyond words—mystical, healing, forgiving.',
    3: 'The Moon (Cancer\'s ruler) nurtures Scorpio\'s intensity. Power serves protection, transformation births new life. The phoenix energy here is maternal—fierce love that destroys only to rebuild.',
  },
  Sagittarius: {
    1: 'Jupiter rules Jupiter—expansion without limits. This is the explorer setting out, the philosopher questioning everything, the teacher who learns by living. Truth is pursued with abandon, horizons are meant to be crossed.',
    2: 'Mars (Aries\' ruler) ignites Jupiter\'s vision. Philosophy becomes mission, learning becomes adventure. The seeker doesn\'t just think about truth—they charge toward it, pioneering new paths of meaning.',
    3: 'The Sun (Leo\'s ruler) illuminates Sagittarius\' journey. The explorer becomes the teacher, wisdom becomes performance. Knowledge here wants to shine, to inspire, to generously light others\' way.',
  },
  Capricorn: {
    1: 'Saturn rules Saturn—structure in its purest form. This is the mountain itself: patient, enduring, ambitious. Achievement comes through time, authority through earned wisdom, success through unshakeable foundations.',
    2: 'Venus (Taurus\' ruler) enriches Saturn\'s climb. Ambition discovers pleasure, structure builds wealth. The achiever learns that success should feel good—legacy includes enjoyment, not just accomplishment.',
    3: 'Mercury (Virgo\'s ruler) refines Capricorn\'s work. Mastery serves others, achievement becomes excellence. The authority here is the true expert—one who has perfected their craft through devoted practice.',
  },
  Aquarius: {
    1: 'Uranus/Saturn rule the future—revolution meets structure. This is the visionary who builds, the rebel with a plan. Individuality serves collective evolution, freedom is earned through responsibility.',
    2: 'Mercury (Gemini\'s ruler) spreads Aquarian ideas. The visionary becomes the networker—not just thinking differently, but connecting different minds. Innovation happens through communication.',
    3: 'Venus (Libra\'s ruler) balances Aquarius\' change. Revolution becomes diplomacy, progress serves harmony. The radical learns that lasting change comes through relationship, not just rejection.',
  },
  Pisces: {
    1: 'Neptune/Jupiter rule the mystic ocean—boundless compassion, spiritual sensitivity. This is where ego dissolves into unity, where dreams are as real as waking. The soul remembers it is everything.',
    2: 'The Moon (Cancer\'s ruler) nurtures Pisces\' sensitivity. Mysticism finds home, spirituality becomes care. The dreamer builds sanctuary, intuition protects the vulnerable, imagination serves the heart.',
    3: 'Pluto/Mars (Scorpio\'s rulers) give Pisces power. Compassion becomes transformation, surrender becomes strength. The mystic here is also the healer—one who dives into darkness and brings back light.',
  },
};

/**
 * Get the decan information for a given degree and sign.
 * @param degree - The degree within the sign (0-29)
 * @param sign - The zodiac sign name
 */
export const getDecan = (degree: number, sign: string): Decan => {
  const deg = Math.floor(degree);
  const triplicity = getTriplicity(sign);
  const signIndex = triplicity.indexOf(sign);
  
  let decanNumber: 1 | 2 | 3;
  let rulerSign: string;
  
  if (deg < 10) {
    decanNumber = 1;
    // 1st decan ruled by the sign itself
    rulerSign = sign;
  } else if (deg < 20) {
    decanNumber = 2;
    // 2nd decan ruled by the next sign in the triplicity
    rulerSign = triplicity[(signIndex + 1) % 3];
  } else {
    decanNumber = 3;
    // 3rd decan ruled by the third sign in the triplicity
    rulerSign = triplicity[(signIndex + 2) % 3];
  }
  
  const ruler = SIGN_RULERS[rulerSign] || { planet: rulerSign, symbol: '?' };
  const descriptions = DECAN_DESCRIPTIONS[sign] || {
    1: `First decan of ${sign}`,
    2: `Second decan of ${sign}`,
    3: `Third decan of ${sign}`,
  };
  
  return {
    number: decanNumber,
    degrees: decanNumber === 1 ? '0°–9°' : decanNumber === 2 ? '10°–19°' : '20°–29°',
    ruler: ruler.planet,
    rulerSymbol: ruler.symbol,
    quality: DECAN_QUALITIES[decanNumber],
    description: descriptions[decanNumber],
  };
};

/**
 * Get a short label for a decan
 */
export const getDecanLabel = (degree: number, sign: string): string => {
  const decan = getDecan(degree, sign);
  return `${decan.number}${decan.number === 1 ? 'st' : decan.number === 2 ? 'nd' : 'rd'} Decan (${decan.rulerSymbol} ${decan.ruler})`;
};
