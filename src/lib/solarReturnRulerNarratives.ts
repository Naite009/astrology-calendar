/**
 * Data-driven narratives for the SR Ascendant Ruler in both the SR chart (Plot)
 * and the natal chart (Setting).
 *
 * Every combination of planet + sign + house produces a specific, felt-sense
 * interpretation — no generic filler.
 */

// ─── Planet-in-Sign energy descriptors ──────────────────────────────

const PLANET_IN_SIGN_ENERGY: Record<string, Record<string, string>> = {
  Sun: {
    Aries: 'bold self-assertion, impatience with delay, and a need to be first',
    Taurus: 'steady persistence, sensory pleasure-seeking, and resistance to being rushed',
    Gemini: 'mental restlessness, curiosity-driven exploration, and constant information exchange',
    Cancer: 'emotional protectiveness, home-centered focus, and nurturing instincts',
    Leo: 'creative self-expression, desire for recognition, and generous warmth',
    Virgo: 'analytical precision, health-consciousness, and a drive to be useful',
    Libra: 'diplomatic relating, aesthetic sensitivity, and partnership focus',
    Scorpio: 'intense transformation, power dynamics, and deep psychological insight',
    Sagittarius: 'expansive optimism, philosophical seeking, and restless adventure',
    Capricorn: 'disciplined ambition, structural authority, and long-term building',
    Aquarius: 'unconventional independence, group consciousness, and future-oriented thinking',
    Pisces: 'intuitive dissolving of boundaries, spiritual receptivity, and creative imagination',
  },
  Moon: {
    Aries: 'emotional impulsiveness — you react first, process later, and need physical outlets for feelings',
    Taurus: 'emotional steadiness — you crave stability, comfort, routine, and resist sudden change',
    Gemini: 'emotional restlessness — feelings shift rapidly and talking about them helps more than sitting with them',
    Cancer: 'deep emotional sensitivity — you absorb others\' moods, need safety, and retreat when overwhelmed',
    Leo: 'emotional warmth and generosity — you need to feel appreciated and express feelings dramatically',
    Virgo: 'emotional analysis — you process feelings by organizing, fixing, and problem-solving',
    Libra: 'emotional diplomacy — you avoid conflict, seek harmony, and feel unsettled when relationships are tense',
    Scorpio: 'emotional intensity at maximum volume — trust is everything, betrayal is devastating, feelings run deep',
    Sagittarius: 'emotional optimism — you bounce back quickly, need freedom, and feel trapped by heaviness',
    Capricorn: 'emotional restraint — you internalize feelings, appear stoic, and process through accomplishment',
    Aquarius: 'emotional detachment — you intellectualize feelings and need space to process independently',
    Pisces: 'emotional permeability — you absorb everything around you and need solitude to decompress',
  },
  Mercury: {
    Aries: 'quick, direct communication — you speak before you think, argue to process, and get bored with slow explanations',
    Taurus: 'deliberate, practical thinking — you process slowly but thoroughly and communicate with grounded common sense',
    Gemini: 'rapid-fire mental agility — ideas come fast, conversations energize you, and you juggle multiple projects naturally',
    Cancer: 'intuitive thinking colored by emotion — memory is strong, communication is personal, and words carry feeling',
    Leo: 'expressive, confident communication — you present ideas with flair and conviction, sometimes dramatically',
    Virgo: 'precise, analytical thinking — you notice every detail, edit compulsively, and communicate with practical clarity',
    Libra: 'balanced, diplomatic communication — you see every side, which makes decisions slow but conversations graceful',
    Scorpio: 'penetrating, investigative thinking — you probe beneath surfaces and communicate with strategic intensity',
    Sagittarius: 'big-picture thinking — you connect ideas across disciplines, speak freely, and sometimes overstate',
    Capricorn: 'structured, authoritative communication — you plan your words, think long-term, and speak with gravity',
    Aquarius: 'innovative, unconventional thinking — your ideas are ahead of their time and communication is unpredictable',
    Pisces: 'imaginative, intuitive communication — you think in images, absorb ideas osmotically, and sometimes lose clarity',
  },
  Venus: {
    Aries: 'you attract through boldness and directness — impatient in love, competitive in values, action-oriented in pleasure',
    Taurus: 'you attract through stability and sensuality — loyal, comfort-seeking, slow to commit but deeply devoted',
    Gemini: 'you attract through wit and conversation — flirtatious, intellectually stimulated, variety-seeking in connection',
    Cancer: 'you attract through nurturing and emotional safety — protective in love, sentimental about the past',
    Leo: 'you attract through warmth and generosity — romantic, expressive, and you need to feel adored',
    Virgo: 'you attract through helpfulness and reliability — love expressed as acts of service, critical of yourself in relationships',
    Libra: 'you attract naturally through charm and fairness — partnership is central, beauty matters, conflict feels unbearable',
    Scorpio: 'you attract through magnetic intensity — all-or-nothing in love, possessive, deeply loyal beneath the surface',
    Sagittarius: 'you attract through enthusiasm and adventure — freedom-loving, generous, resistant to routine in relationships',
    Capricorn: 'you attract through competence and reliability — traditional in values, slow to open up, loyal once committed',
    Aquarius: 'you attract through uniqueness and independence — unconventional in love, needs space, values friendship in romance',
    Pisces: 'you attract through compassion and imagination — idealistic in love, boundary-less, capable of deep devotion',
  },
  Mars: {
    Aries: 'raw, direct energy — you act immediately, compete fiercely, anger fast and recover fast',
    Taurus: 'slow-building, stubborn energy — hard to start but unstoppable once moving, anger builds to eruption',
    Gemini: 'scattered, mentally-driven energy — you fight with words, multitask aggressively, and get restless quickly',
    Cancer: 'emotionally-fueled action — you fight for family and security, anger expressed through moodiness and withdrawal',
    Leo: 'dramatic, confident energy — you lead boldly, compete for attention, and anger with theatrical intensity',
    Virgo: 'precise, methodical energy — you work tirelessly on details, anger expressed as sharp criticism',
    Libra: 'passive-aggressive energy — you avoid direct confrontation, act through others, and seethe beneath diplomacy',
    Scorpio: 'intense, strategic energy — you act with calculated precision, hold grudges, and fight to win absolutely',
    Sagittarius: 'expansive, restless energy — you take big risks, fight for beliefs, and anger is righteous but brief',
    Capricorn: 'disciplined, enduring energy — you work relentlessly toward goals, anger is controlled and cold',
    Aquarius: 'rebellious, erratic energy — you fight for causes, act unpredictably, and resist being controlled',
    Pisces: 'diffuse, passive energy — you act on intuition, avoid confrontation, and anger dissolves into confusion',
  },
  Jupiter: {
    Aries: 'growth through bold initiative — luck comes when you act first and take risks others avoid',
    Taurus: 'growth through patient accumulation — abundance builds slowly through steady effort and material wisdom',
    Gemini: 'growth through learning and connections — opportunity comes through communication, networking, and curiosity',
    Cancer: 'growth through emotional generosity — abundance comes through family, nurturing others, and creating safety',
    Leo: 'growth through creative self-expression — opportunity comes through visibility, leadership, and generous display',
    Virgo: 'growth through service and precision — abundance comes through skill development, health improvement, and humility',
    Libra: 'growth through partnerships — opportunity comes through collaboration, negotiation, and artistic refinement',
    Scorpio: 'growth through transformation — abundance comes through crisis, deep investigation, and confronting hidden truths',
    Sagittarius: 'growth through expansion in every direction — travel, education, philosophy, and taking the broadest possible view',
    Capricorn: 'growth through discipline and structure — abundance comes through long-term professional investment and authority',
    Aquarius: 'growth through innovation and community — opportunity comes through groups, technology, and unconventional approaches',
    Pisces: 'growth through surrender and faith — abundance comes through spiritual practice, artistic vision, and letting go of control',
  },
  Saturn: {
    Aries: 'lessons in patience and impulse control — you are being taught that not every battle needs to be fought immediately',
    Taurus: 'lessons in material discipline — you are learning the difference between security and hoarding, stability and stagnation',
    Gemini: 'lessons in focused thinking — scattered communication must become disciplined, ideas must be followed through',
    Cancer: 'lessons in emotional boundaries — you are learning to nurture without losing yourself, to feel without drowning',
    Leo: 'lessons in humility and authentic confidence — ego must be earned through substance, not performance',
    Virgo: 'lessons in self-compassion — perfectionism becomes productive only when you stop punishing yourself for being human',
    Libra: 'lessons in relationship responsibility — fairness must be genuine, not people-pleasing disguised as diplomacy',
    Scorpio: 'lessons in power and control — you are learning to hold power without manipulating, to trust without testing',
    Sagittarius: 'lessons in intellectual discipline — beliefs must be tested, optimism must be grounded, promises must be kept',
    Capricorn: 'lessons in sustainable ambition — success requires patience, and authority must be exercised with integrity',
    Aquarius: 'lessons in committed individuality — rebellion for its own sake is immature, real independence requires responsibility',
    Pisces: 'lessons in practical spirituality — faith without structure dissolves, boundaries are essential for genuine compassion',
  },
  Uranus: {
    Aries: 'sudden breakthroughs in personal identity — unexpected changes in how you present yourself and take action',
    Taurus: 'disruptions to financial stability or values — what you thought was solid shifts, forcing new definitions of security',
    Gemini: 'radical shifts in thinking and communication — new ideas arrive fast and change your mental landscape',
    Cancer: 'unexpected changes in home and family — domestic life is unpredictable, emotional patterns break suddenly',
    Leo: 'breakthroughs in creative expression — you discover new ways to be seen, possibly through unconventional channels',
    Virgo: 'disruptions to daily routines and health — old habits break, new systems must be invented from scratch',
    Libra: 'unexpected relationship developments — partnerships form or dissolve suddenly, social dynamics shift',
    Scorpio: 'deep psychological breakthroughs — hidden material surfaces abruptly, power structures collapse and rebuild',
    Sagittarius: 'sudden expansions of worldview — travel, education, or philosophical revelations change your perspective overnight',
    Capricorn: 'disruptions to career and authority structures — professional reinvention, institutional change, status shifts',
    Aquarius: 'radical authenticity emerging — you stop conforming, community connections shift, future vision clarifies suddenly',
    Pisces: 'spiritual breakthroughs and dissolution — intuition heightens dramatically, reality and imagination blur',
  },
  Neptune: {
    Aries: 'confusion around identity and direction — your sense of self softens, requiring trust in an unclear path forward',
    Taurus: 'dissolving material certainty — financial boundaries blur, values become more spiritual than material',
    Gemini: 'mental fog and creative imagination — rational thinking becomes dreamy, communication becomes more poetic',
    Cancer: 'emotional boundaries dissolve — you absorb family feelings, home life becomes more spiritual or chaotic',
    Leo: 'creative and romantic idealization — artistic vision heightens but ego identity becomes less certain',
    Virgo: 'dissolution of perfectionist control — health and routines become unpredictable, surrender replaces organization',
    Libra: 'idealized relationships — you see partners through rose-colored glasses, beauty and art become transcendent',
    Scorpio: 'psychic intensity and boundary dissolution — deep unconscious material surfaces through dreams and intuition',
    Sagittarius: 'spiritual seeking and philosophical confusion — beliefs expand beyond rational frameworks into mystical territory',
    Capricorn: 'dissolving career structures — professional identity becomes uncertain, ambition softens into something less defined',
    Aquarius: 'idealistic community vision — group involvements become spiritual or confusing, future plans lack concrete form',
    Pisces: 'maximum spiritual receptivity — you are a sponge for everything around you, creative and intuitive gifts peak',
  },
  Pluto: {
    Aries: 'intense power struggles around identity — who you are is being fundamentally transformed through confrontation',
    Taurus: 'deep transformation of values and resources — financial or material power dynamics demand reckoning',
    Gemini: 'psychological depth in communication — words carry power, thinking becomes obsessive, mental transformation',
    Cancer: 'family power dynamics surface — emotional control patterns are exposed and must be transformed',
    Leo: 'creative and ego transformation — your relationship with power, attention, and self-expression fundamentally shifts',
    Virgo: 'obsessive health or work focus — daily life undergoes deep restructuring, control issues surface around routine',
    Libra: 'relationship power dynamics exposed — partnerships undergo intense transformation, hidden resentments surface',
    Scorpio: 'maximum transformative intensity — death and rebirth themes dominate, nothing stays hidden, power is raw',
    Sagittarius: 'transformation of beliefs and worldview — philosophical or religious crisis leads to deeper truth',
    Capricorn: 'career and authority transformation — professional power structures are dismantled and rebuilt from the foundation',
    Aquarius: 'transformation of group dynamics — community power structures shift, your role in collective movements changes',
    Pisces: 'spiritual transformation and surrender — the deepest unconscious material surfaces for integration',
  },
};

// ─── House experience descriptors (SR context) ─────────────────────

const SR_HOUSE_PLOT: Record<number, string> = {
  1: 'The action centers on YOU — your appearance, your first impressions, how you show up in every room. You feel physically different this year. Others notice a shift in your energy before you explain anything.',
  2: 'The action centers on money, possessions, and self-worth. What you earn, what you spend, what you value — these become the plot of your year. Financial decisions carry unusual weight.',
  3: 'The action centers on communication, learning, siblings, and your immediate neighborhood. Your daily conversations, short trips, writing projects, and local connections drive the year\'s story.',
  4: 'The action centers on home, family, roots, and private life. Where you live, how you nest, family dynamics, and your inner emotional foundation are this year\'s main stage.',
  5: 'The action centers on creativity, romance, children, and joy. What you create, who you play with, and what brings you genuine pleasure become the year\'s central plot.',
  6: 'The action centers on daily routines, health habits, work responsibilities, and service. How you structure your days, care for your body, and show up at work drives everything else.',
  7: 'The action centers on one-on-one partnerships — romantic, business, or significant others. Relationship dynamics, negotiations, and how you show up for another person dominate the year.',
  8: 'The action centers on shared resources, intimacy, debt, taxes, and psychological transformation. What you owe, what you share, and what you\'re afraid to look at come to the surface.',
  9: 'The action centers on higher learning, travel, philosophy, publishing, and expanding your worldview. The year pushes you beyond familiar territory into bigger questions.',
  10: 'The action centers on career, public reputation, and your role in the world. Professional achievements, authority figures, and your visible legacy drive the year.',
  11: 'The action centers on friendships, groups, communities, and your vision for the future. Who you surround yourself with and what you hope for shapes everything.',
  12: 'The action centers on solitude, rest, spiritual practice, and what\'s hidden. The year\'s real work happens internally — therapy, meditation, retreat, processing what\'s been buried.',
};

// ─── House experience descriptors (Natal context — where it lands) ──

const NATAL_HOUSE_SETTING: Record<number, string> = {
  1: 'This year\'s themes land directly on your identity and self-image. The way you see yourself — your body, your confidence, your presence — is where you\'ll feel the effects most personally.',
  2: 'This year\'s themes land in your finances and self-worth. Your bank account, your relationship with money, and how much you believe you deserve are the backdrop for everything.',
  3: 'This year\'s themes land in your communication and learning. Your daily conversations, your relationship with siblings, your neighborhood, and how you process information are where the story plays out.',
  4: 'This year\'s themes land in your home and family life. Your living situation, relationship with parents, and your deepest sense of emotional security are where the effects accumulate.',
  5: 'This year\'s themes land in your creative life and romance. Your hobbies, love affairs, relationship with children, and what genuinely brings you joy are the canvas.',
  6: 'This year\'s themes land in your health and daily work. Your body, your routines, your job responsibilities, and your relationship with being of service are the ground level.',
  7: 'This year\'s themes land in your closest partnerships. Your marriage, business partnerships, or most significant one-on-one relationships are where you\'ll feel it all.',
  8: 'This year\'s themes land in your deepest intimacy and shared resources. Joint finances, psychological vulnerability, sexuality, and what you\'re afraid to confront are the setting.',
  9: 'This year\'s themes land in your beliefs and broader horizons. Travel, education, publishing, legal matters, and your philosophical framework are the territory.',
  10: 'This year\'s themes land in your career and public life. Your professional reputation, relationship with authority, and what you\'re known for are where the effects concentrate.',
  11: 'This year\'s themes land in your social world and future vision. Your friendships, group involvements, causes you care about, and your hopes for what comes next are the backdrop.',
  12: 'This year\'s themes land in your inner world and subconscious. Therapy, spiritual practice, solitude, hidden fears, and the patterns you don\'t usually see are the real setting.',
};

/**
 * Generate a specific, felt-sense interpretation for the "Plot" —
 * the SR Ascendant ruler's placement in the SR chart.
 */
export function generatePlotNarrative(
  rulerPlanet: string,
  srSign: string,
  srHouse: number | null,
): string {
  const signEnergy = PLANET_IN_SIGN_ENERGY[rulerPlanet]?.[srSign];
  const housePlot = srHouse ? SR_HOUSE_PLOT[srHouse] : null;

  const parts: string[] = [];

  if (signEnergy) {
    parts.push(`With ${rulerPlanet} in ${srSign} steering your year, the dominant energy is ${signEnergy}.`);
  }

  if (housePlot) {
    parts.push(housePlot);
  }

  if (!signEnergy && !housePlot) {
    return 'The year\'s energy and style are shaped by where this ruler sits in the Solar Return chart.';
  }

  return parts.join(' ');
}

/**
 * Generate a specific, felt-sense interpretation for the "Setting" —
 * the SR Ascendant ruler's placement in the natal chart.
 */
export function generateSettingNarrative(
  rulerPlanet: string,
  natalSign: string,
  natalHouse: number | null,
): string {
  const signEnergy = PLANET_IN_SIGN_ENERGY[rulerPlanet]?.[natalSign];
  const houseSetting = natalHouse ? NATAL_HOUSE_SETTING[natalHouse] : null;

  const parts: string[] = [];

  if (houseSetting) {
    parts.push(houseSetting);
  }

  if (signEnergy) {
    parts.push(`Your natal ${rulerPlanet} in ${natalSign} means you naturally process this through ${signEnergy}. That\'s the lens — the way you instinctively respond to whatever this year brings.`);
  }

  if (!signEnergy && !houseSetting) {
    return 'The year\'s themes land in the life area governed by this natal house.';
  }

  return parts.join(' ');
}
