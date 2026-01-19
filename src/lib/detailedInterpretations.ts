// ============================================================================
// COMPLETE HOUSE SYSTEM & DETAILED INTERPRETATIONS
// 5-layer interpretations with planet essences, signs, houses, guidance, prompts
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOrdinal = (num: number): string => {
  if (num === 1 || num === 21 || num === 31) return 'st';
  if (num === 2 || num === 22) return 'nd';
  if (num === 3 || num === 23) return 'rd';
  return 'th';
};

// ============================================================================
// HOUSE MEANINGS DATABASE
// ============================================================================

export const HOUSE_MEANINGS = {
  1: {
    short: "Self & Identity",
    full: "Self, identity, appearance, first impressions, how you meet the world, personal style",
    keywords: "I AM, beginnings, body, personality, outlook"
  },
  2: {
    short: "Money & Values",
    full: "Money, possessions, values, self-worth, resources, what you own, earning capacity",
    keywords: "I HAVE, security, material world, talents, priorities"
  },
  3: {
    short: "Communication",
    full: "Communication, siblings, short trips, learning, writing, daily interactions, neighbors",
    keywords: "I THINK, mind, speech, curiosity, early education"
  },
  4: {
    short: "Home & Family",
    full: "Home, family, roots, emotional foundation, where you come from, private life (IC)",
    keywords: "I FEEL, ancestry, nurturing, emotional security, endings"
  },
  5: {
    short: "Creativity & Joy",
    full: "Creativity, romance, children, play, self-expression, what brings joy, hobbies",
    keywords: "I CREATE, pleasure, drama, risk, fun, heart"
  },
  6: {
    short: "Work & Health",
    full: "Work, health, daily routines, service, pets, self-improvement, duty, habits",
    keywords: "I SERVE, wellness, analysis, efficiency, practical matters"
  },
  7: {
    short: "Partnerships",
    full: "Partnerships, marriage, contracts, others, what you attract, open enemies (DSC)",
    keywords: "I RELATE, balance, cooperation, projection, legal bonds"
  },
  8: {
    short: "Transformation",
    full: "Shared resources, intimacy, transformation, death/rebirth, other people's money, psychology",
    keywords: "I TRANSFORM, depth, power, sex, inheritance, crisis"
  },
  9: {
    short: "Expansion",
    full: "Higher learning, travel, philosophy, spirituality, expansion, meaning, publishing",
    keywords: "I UNDERSTAND, wisdom, faith, adventure, worldview"
  },
  10: {
    short: "Career & Status",
    full: "Career, public life, reputation, authority, what you're known for, ambition (MC)",
    keywords: "I ACHIEVE, status, vocation, legacy, contribution"
  },
  11: {
    short: "Community",
    full: "Community, friendships, groups, hopes, social networks, collective work, ideals",
    keywords: "I UNITE, innovation, humanity, dreams, tribe"
  },
  12: {
    short: "Spirituality",
    full: "Spirituality, unconscious, hidden enemies, self-undoing, dreams, transcendence, karma",
    keywords: "I SURRENDER, compassion, mysticism, solitude, sacrifice"
  }
};

// ============================================================================
// PLANET ESSENCES DATABASE
// ============================================================================

export const PLANET_ESSENCES: Record<string, { symbol: string; name: string; essence: string; represents: string }> = {
  sun: {
    symbol: '☉',
    name: 'Sun',
    essence: "Your core identity, vitality, and life force. Who you are when you're most yourself.",
    represents: "ego, consciousness, father, authority, creativity, heart, purpose"
  },
  moon: {
    symbol: '☽',
    name: 'Moon',
    essence: "Your emotional nature, instincts, and inner world. How you feel, nurture, and find comfort.",
    represents: "emotions, mother, home, security, habits, unconscious, needs"
  },
  mercury: {
    symbol: '☿',
    name: 'Mercury',
    essence: "Your mind, communication, and how you process information. Your thinking and speaking style.",
    represents: "thinking, speaking, writing, learning, connection, siblings, commerce"
  },
  venus: {
    symbol: '♀',
    name: 'Venus',
    essence: "Your values, love nature, and sense of beauty. What you attract and appreciate.",
    represents: "love, beauty, money, values, pleasure, relationships, art, harmony"
  },
  mars: {
    symbol: '♂',
    name: 'Mars',
    essence: "Your drive, desire, and will to act. How you assert yourself and take action.",
    represents: "energy, anger, passion, courage, sex drive, ambition, war, assertion"
  },
  jupiter: {
    symbol: '♃',
    name: 'Jupiter',
    essence: "Your faith, growth, and expansion. Where you find meaning, luck, and abundance.",
    represents: "optimism, wisdom, expansion, luck, philosophy, excess, generosity"
  },
  saturn: {
    symbol: '♄',
    name: 'Saturn',
    essence: "Your discipline, structure, and life lessons. Where you mature through challenge and time.",
    represents: "responsibility, limits, time, mastery, father time, karma, authority"
  },
  uranus: {
    symbol: '♅',
    name: 'Uranus',
    essence: "Your individuality and need for freedom. Where you break rules, rebel, and awaken.",
    represents: "rebellion, change, innovation, awakening, electricity, genius, revolution"
  },
  neptune: {
    symbol: '♆',
    name: 'Neptune',
    essence: "Your spirituality, dreams, and imagination. Where boundaries dissolve and you transcend.",
    represents: "illusion, compassion, art, spirituality, confusion, unity, mysticism"
  },
  pluto: {
    symbol: '♇',
    name: 'Pluto',
    essence: "Your power and transformation. Where you experience death, rebirth, and deep change.",
    represents: "power, death/rebirth, obsession, depth, shadow, regeneration, control"
  },
  chiron: {
    symbol: '⚷',
    name: 'Chiron',
    essence: "Your deepest wound and greatest healing gift. Where you teach others what hurt you most.",
    represents: "wound, healer, mentor, bridge, pain into wisdom, sacred wound"
  },
  vesta: {
    symbol: '⚶',
    name: 'Vesta',
    essence: "Your sacred focus and devotion. What you tend like a holy flame with ritual dedication.",
    represents: "dedication, ritual, sacred work, focus, purity, service, commitment"
  },
  ceres: {
    symbol: '⚳',
    name: 'Ceres',
    essence: "Your nurturing style and need to be nurtured. How you mother and care for others.",
    represents: "mothering, nourishment, cycles, grief, unconditional love, sustenance"
  },
  pallas: {
    symbol: '⚴',
    name: 'Pallas',
    essence: "Your wisdom, strategy, and pattern recognition. How you solve problems creatively.",
    represents: "wisdom, strategy, justice, healing, creative intelligence, advocacy"
  },
  juno: {
    symbol: '⚵',
    name: 'Juno',
    essence: "Your partnership needs and commitment style. What you need in intimate relationships.",
    represents: "partnership, commitment, jealousy, power in relationships, loyalty"
  },
  northnode: {
    symbol: '☊',
    name: 'North Node',
    essence: "Your destiny and life purpose. The direction your soul is meant to grow toward.",
    represents: "dharma, growth direction, future, soul mission, uncomfortable growth"
  },
  lilith: {
    symbol: '⚸',
    name: 'Black Moon Lilith',
    essence: "Your wild, untamed feminine power. Where you refuse to be tamed or controlled.",
    represents: "raw sexuality, rage, independence, the shadow feminine, rebellion"
  },
  eris: {
    symbol: '⯰',
    name: 'Eris',
    essence: "Your Feminine Warrior energy and soul purpose. What you fight for and cannot NOT do.",
    represents: "discord that reveals truth, feminine warrior, soul purpose, paradigm shifting, outsider power, necessary chaos"
  },
  ascendant: {
    symbol: 'ASC',
    name: 'Ascendant',
    essence: "How you meet the world. Your mask, first impression, and physical presence.",
    represents: "appearance, persona, approach, dawn of self, immediate environment"
  },
  sedna: {
    symbol: '⯲',
    name: 'Sedna',
    essence: "Your deepest wound around betrayal, abandonment, and victimization. Where you must reclaim sovereignty from the depths.",
    represents: "deep survival, betrayal transcendence, victim to sovereign, ocean depths of psyche, ancestral trauma, self-sufficiency"
  },
  makemake: {
    symbol: '🜨',
    name: 'Makemake',
    essence: "Your connection to primal creation and environmental consciousness. Where you create something from nothing.",
    represents: "creation, fertility, environmental awareness, resourcefulness, connection to Earth, manifestation from void"
  },
  haumea: {
    symbol: '🜵',
    name: 'Haumea',
    essence: "Your capacity for rebirth and regeneration. The creative life force that renews and transforms.",
    represents: "rebirth, regeneration, fertility goddess, creative life force, rapid transformation, sacred creation"
  },
  quaoar: {
    symbol: '🝾',
    name: 'Quaoar',
    essence: "Your power to manifest through sacred rhythm and dance. Creation through resonance and vibration.",
    represents: "creation through dance/song, sacred rhythm, manifestation, cosmic order, bringing form from chaos"
  },
  orcus: {
    symbol: '🝿',
    name: 'Orcus',
    essence: "Your relationship to oaths, promises, and karmic contracts. Where broken vows have consequences.",
    represents: "oaths and promises, karmic contracts, consequence of betrayal, underworld justice, integrity, shadow Pluto"
  },
  ixion: {
    symbol: '⯳',
    name: 'Ixion',
    essence: "Your shadow around gratitude, entitlement, and abuse of privilege. Where you must learn ethical boundaries.",
    represents: "abuse of trust, entitlement vs gratitude, ethical lessons, second chances, repetitive patterns"
  },
  varuna: {
    symbol: '⯴',
    name: 'Varuna',
    essence: "Your connection to cosmic law, vast vision, and divine order. The all-seeing eye of truth.",
    represents: "cosmic law, vast perspective, truth and lies, fame/infamy, divine order, all-seeing awareness"
  },
  pholus: {
    symbol: '⯛',
    name: 'Pholus',
    essence: "Where small actions create massive change. The catalyst that uncorks generational patterns.",
    represents: "small cause big effect, catalyst, generational healing, addiction patterns, opening Pandora's box, turning points"
  },
  nessus: {
    symbol: '⯜',
    name: 'Nessus',
    essence: "Where cycles of abuse, karma, and toxic patterns end. The buck stops here energy.",
    represents: "ending abuse cycles, karmic return, toxic patterns, accountability, the buck stops here, breaking chains"
  }
};

// ============================================================================
// ASPECT MEANINGS DATABASE
// ============================================================================

export const ASPECT_MEANINGS: Record<string, { symbol: string; angle: number; meaning: string; description: string; keywords: string; energy: string }> = {
  conjunction: {
    symbol: '☌',
    angle: 0,
    meaning: "merging, blending, intensifying",
    description: "These energies merge into one unified force. What happens when they become the same thing?",
    keywords: "fusion, intensity, new beginning, potential, combination",
    energy: "POWER - These planets act as one"
  },
  opposition: {
    symbol: '☍',
    angle: 180,
    meaning: "polarity, balance, awareness",
    description: "These energies pull in opposite directions creating awareness. Can you hold both truths?",
    keywords: "awareness, balance, relationship, mirror, projection, integration",
    energy: "TENSION - Find the balance between opposites"
  },
  trine: {
    symbol: '△',
    angle: 120,
    meaning: "harmony, ease, flow",
    description: "These energies support each other naturally. Gifts flow without effort or friction.",
    keywords: "talent, ease, natural, grace, luck, flowing support",
    energy: "GRACE - Effortless harmony and natural gifts"
  },
  square: {
    symbol: '□',
    angle: 90,
    meaning: "tension, challenge, growth",
    description: "These energies create friction and discomfort. The tension pushes you to grow and act.",
    keywords: "challenge, action, growth, dynamic, motivation, crisis",
    energy: "FRICTION - Uncomfortable growth through challenge"
  },
  sextile: {
    symbol: '⚹',
    angle: 60,
    meaning: "opportunity, cooperation",
    description: "These energies work well together if you activate them. Opportunity knocks - will you answer?",
    keywords: "potential, opportunity, skill, ease, talent, possibility",
    energy: "OPPORTUNITY - Potential waiting to be activated"
  }
};

// ============================================================================
// SIGN EXPRESSION DATABASE
// ============================================================================

const SIGN_EXPRESSIONS: Record<string, string> = {
  // SUN IN SIGNS
  'Sun-Aries': "= Pioneering identity. You shine through courage, independence, and bold action.",
  'Sun-Taurus': "= Grounded identity. You shine through stability, sensuality, and steady presence.",
  'Sun-Gemini': "= Curious identity. You shine through communication, wit, and mental agility.",
  'Sun-Cancer': "= Nurturing identity. You shine through emotional depth, care, and protection.",
  'Sun-Leo': "= Creative identity. You shine through self-expression, drama, and generous heart.",
  'Sun-Virgo': "= Analytical identity. You shine through service, precision, and improvement.",
  'Sun-Libra': "= Harmonious identity. You shine through balance, beauty, and relationship.",
  'Sun-Scorpio': "= Intense identity. You shine through depth, power, and transformation.",
  'Sun-Sagittarius': "= Expansive identity. You shine through adventure, truth, and philosophy.",
  'Sun-Capricorn': "= Ambitious identity. You shine through achievement, mastery, and responsibility.",
  'Sun-Aquarius': "= Innovative identity. You shine through uniqueness, community, and revolution.",
  'Sun-Pisces': "= Mystical identity. You shine through compassion, dreams, and transcendence.",
  
  // MOON IN SIGNS
  'Moon-Aries': "= Impulsive emotions. You feel through instinct and need freedom to react.",
  'Moon-Taurus': "= Stable emotions. You feel through body and need physical comfort.",
  'Moon-Gemini': "= Curious emotions. You feel through words and need mental stimulation.",
  'Moon-Cancer': "= Deep emotions. You feel through intuition and need emotional safety.",
  'Moon-Leo': "= Dramatic emotions. You feel through heart and need to be seen.",
  'Moon-Virgo': "= Analytical emotions. You feel through service and need order.",
  'Moon-Libra': "= Harmonious emotions. You feel through others and need balance.",
  'Moon-Scorpio': "= Intense emotions. You feel through depth and need transformation.",
  'Moon-Sagittarius': "= Free emotions. You feel through philosophy and need adventure.",
  'Moon-Capricorn': "= Disciplined emotions. You feel through structure and need control.",
  'Moon-Aquarius': "= Detached emotions. You feel through ideals and need space.",
  'Moon-Pisces': "= Mystical emotions. You feel through empathy and need transcendence.",
  
  // MERCURY IN SIGNS
  'Mercury-Aries': "= Direct communication. You think fast and speak boldly.",
  'Mercury-Taurus': "= Deliberate communication. You think slowly and speak with certainty.",
  'Mercury-Gemini': "= Quick communication. You think rapidly and speak prolifically.",
  'Mercury-Cancer': "= Emotional communication. You think with feeling and speak from the heart.",
  'Mercury-Leo': "= Dramatic communication. You think creatively and speak with flair.",
  'Mercury-Virgo': "= Precise communication. You think analytically and speak accurately.",
  'Mercury-Libra': "= Diplomatic communication. You think fairly and speak harmoniously.",
  'Mercury-Scorpio': "= Intense communication. You think deeply and speak powerfully.",
  'Mercury-Sagittarius': "= Expansive communication. You think philosophically and speak freely.",
  'Mercury-Capricorn': "= Structured communication. You think practically and speak authoritatively.",
  'Mercury-Aquarius': "= Innovative communication. You think uniquely and speak unconventionally.",
  'Mercury-Pisces': "= Intuitive communication. You think symbolically and speak poetically.",
  
  // VENUS IN SIGNS
  'Venus-Aries': "= Passionate love. You value independence and are attracted to boldness.",
  'Venus-Taurus': "= Sensual love. You value stability and are attracted to beauty.",
  'Venus-Gemini': "= Playful love. You value variety and are attracted to wit.",
  'Venus-Cancer': "= Nurturing love. You value security and are attracted to care.",
  'Venus-Leo': "= Romantic love. You value admiration and are attracted to drama.",
  'Venus-Virgo': "= Practical love. You value service and are attracted to competence.",
  'Venus-Libra': "= Harmonious love. You value partnership and are attracted to grace.",
  'Venus-Scorpio': "= Intense love. You value depth and are attracted to power.",
  'Venus-Sagittarius': "= Free love. You value adventure and are attracted to wisdom.",
  'Venus-Capricorn': "= Committed love. You value loyalty and are attracted to success.",
  'Venus-Aquarius': "= Unconventional love. You value friendship and are attracted to uniqueness.",
  'Venus-Pisces': "= Mystical love. You value compassion and are attracted to spirituality.",
  
  // MARS IN SIGNS
  'Mars-Aries': "= Direct action. You assert yourself boldly and fight courageously.",
  'Mars-Taurus': "= Steady action. You assert yourself slowly and fight stubbornly.",
  'Mars-Gemini': "= Quick action. You assert yourself verbally and fight with words.",
  'Mars-Cancer': "= Emotional action. You assert yourself defensively and fight for family.",
  'Mars-Leo': "= Dramatic action. You assert yourself proudly and fight for recognition.",
  'Mars-Virgo': "= Precise action. You assert yourself efficiently and fight for perfection.",
  'Mars-Libra': "= Balanced action. You assert yourself diplomatically and fight for justice.",
  'Mars-Scorpio': "= Intense action. You assert yourself powerfully and fight to win.",
  'Mars-Sagittarius': "= Free action. You assert yourself freely and fight for truth.",
  'Mars-Capricorn': "= Controlled action. You assert yourself strategically and fight for goals.",
  'Mars-Aquarius': "= Revolutionary action. You assert yourself uniquely and fight for ideals.",
  'Mars-Pisces': "= Intuitive action. You assert yourself gently and fight for compassion.",
  
  // VESTA IN SIGNS
  'Vesta-Aries': "= Sacred independence. Your devotion is to courage and pioneering.",
  'Vesta-Taurus': "= Sacred sensuality. Your devotion is to beauty and earthly pleasure.",
  'Vesta-Gemini': "= Sacred communication. Your devotion is to learning and connection.",
  'Vesta-Cancer': "= Sacred nurturing. Your devotion is to home and emotional care.",
  'Vesta-Leo': "= Sacred creativity. Your devotion is to self-expression and joy.",
  'Vesta-Virgo': "= Sacred service. Your devotion is to perfecting and healing work.",
  'Vesta-Libra': "= Sacred partnership. Your devotion is to harmony and relationship.",
  'Vesta-Scorpio': "= Sacred transformation. Your devotion is to depth and power.",
  'Vesta-Sagittarius': "= Sacred wisdom. Your devotion is to truth and expansion.",
  'Vesta-Capricorn': "= Sacred achievement. Your devotion is to mastery and responsibility.",
  'Vesta-Aquarius': "= Sacred community. Your devotion is to collective work and innovation.",
  'Vesta-Pisces': "= Sacred spirituality. Your devotion is to compassion and transcendence.",
  
  // CHIRON IN SIGNS
  'Chiron-Aries': "= Identity wound. Your deepest pain is about courage, but you heal others' confidence.",
  'Chiron-Taurus': "= Worth wound. Your deepest pain is about value, but you heal others' self-worth.",
  'Chiron-Gemini': "= Communication wound. Your deepest pain is about voice, but you heal others' expression.",
  'Chiron-Cancer': "= Emotion wound. Your deepest pain is about feeling, but you heal others' hearts.",
  'Chiron-Leo': "= Expression wound. Your deepest pain is about visibility, but you heal others' creativity.",
  'Chiron-Virgo': "= Perfection wound. Your deepest pain is about flaws, but you heal others' wholeness.",
  'Chiron-Libra': "= Relationship wound. Your deepest pain is about partnership, but you heal others' connections.",
  'Chiron-Scorpio': "= Power wound. Your deepest pain is about control, but you heal others' transformation.",
  'Chiron-Sagittarius': "= Meaning wound. Your deepest pain is about faith, but you heal others' belief.",
  'Chiron-Capricorn': "= Authority wound. Your deepest pain is about success, but you heal others' ambition.",
  'Chiron-Aquarius': "= Belonging wound. Your deepest pain is about community, but you heal others' uniqueness.",
  'Chiron-Pisces': "= Boundary wound. Your deepest pain is about dissolving, but you heal others' spirituality."
};

const getSignExpression = (planet: string, sign: string): string => {
  const key = `${planet}-${sign}`;
  return SIGN_EXPRESSIONS[key] || `expresses through ${sign}'s energy.`;
};

// ============================================================================
// SIGN COMBINATION MEANINGS
// ============================================================================

const ELEMENTS: Record<string, string[]> = {
  fire: ['Aries', 'Leo', 'Sagittarius'],
  earth: ['Taurus', 'Virgo', 'Capricorn'],
  air: ['Gemini', 'Libra', 'Aquarius'],
  water: ['Cancer', 'Scorpio', 'Pisces']
};

const getElement = (sign: string): string | null => {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return null;
};

const getSignCombination = (sign1: string, sign2: string): string => {
  const el1 = getElement(sign1);
  const el2 = getElement(sign2);
  
  if (!el1 || !el2) return "";
  
  const combos: Record<string, string> = {
    'fire-fire': "🔥🔥 Two fire signs! Passion meets passion. Energy multiplies. Inspiration ignites inspiration.",
    'fire-earth': "🔥🌍 Fire warms earth. Action meets manifestation. Dreams take physical form. Do it!",
    'fire-air': "🔥💨 Fire and air fan each other's flames. Ideas inspire action. Communication fuels passion.",
    'fire-water': "🔥💧 Fire and water create steam. Passion meets feeling. Intense emotional expression.",
    'earth-earth': "🌍🌍 Two earth signs! Practical magic. Things get DONE. Material world mastery.",
    'earth-air': "🌍💨 Earth grounds air. Ideas meet implementation. Theory becomes practice. Build it!",
    'earth-water': "🌍💧 Earth and water make fertile soil. Feeling becomes form. Nurture into being.",
    'air-air': "💨💨 Two air signs! Mental synergy. Ideas multiply. Communication flows. Talk it out!",
    'air-water': "💨💧 Air and water create mist. Thoughts meet feelings. Emotional intelligence blooms.",
    'water-water': "💧💧 Two water signs! Deep emotional resonance. Feel everything. Intuitive understanding."
  };
  
  const key = el1 === el2 ? `${el1}-${el2}` : [el1, el2].sort().join('-');
  return combos[key] || "";
};

// ============================================================================
// HOUSE-TO-HOUSE MEANINGS
// ============================================================================

const getHouseToHouseMeaning = (house1: number, house2: number, aspect: string): string => {
  const meanings: Record<string, string> = {
    '1-7': "Your identity (1st) relates to your partnerships (7th). Who you are shapes how you relate.",
    '1-10': "Your identity (1st) relates to your career (10th). Who you are influences your public role.",
    '2-8': "Your resources (2nd) relate to shared resources (8th). Your money meets others' money.",
    '3-9': "Your communication (3rd) relates to your philosophy (9th). Daily thoughts expand into wisdom.",
    '3-11': "Your communication (3rd) relates to your community (11th). Your words reach your people.",
    '4-10': "Your home (4th) relates to your career (10th). Private life meets public life.",
    '5-11': "Your creativity (5th) relates to your community (11th). Personal joy becomes collective gift.",
    '6-12': "Your daily work (6th) relates to your spirituality (12th). Service becomes sacred practice.",
    '1-5': "Your identity (1st) relates to your creativity (5th). Who you are fuels what you create.",
    '2-6': "Your values (2nd) relate to your daily work (6th). What you value shapes how you serve.",
    '4-8': "Your emotional foundation (4th) relates to transformation (8th). Deep roots allow deep change.",
    '7-9': "Your partnerships (7th) relate to expansion (9th). Relationships broaden your worldview."
  };
  
  const key = [house1, house2].sort((a, b) => a - b).join('-');
  return meanings[key] || `The ${house1}${getOrdinal(house1)} and ${house2}${getOrdinal(house2)} houses ${aspect} each other in your life.`;
};

// ============================================================================
// JOURNAL PROMPT FUNCTION
// ============================================================================

const getJournalPrompt = (transitPlanet: string, natalPlanet: string, transitHouse: number, natalHouse: number): string => {
  const prompts: Record<string, string> = {
    'sun-moon': "How do your identity and emotions interact today? Where do you feel most yourself?",
    'moon-sun': "What emotional truths want to be seen today? How do feelings shape who you are?",
    'mercury-sun': "What truth wants to be spoken? How does your mind serve your identity?",
    'venus-sun': "What do you value about yourself today? Where is beauty meeting identity?",
    'mars-moon': "What action do your emotions require? Where does feeling demand expression?",
    'sun-chiron': "How is your wound teaching today? Where does pain become power?",
    'moon-chiron': "What emotional wound wants healing? How can you mother your hurt?",
    'mercury-pluto': "What deep truth surfaces? What power do your words hold today?",
    'venus-venus': "What do you truly value? What brings you beauty and pleasure right now?",
    'mars-mars': "What motivates you most? Where is your raw energy directed?",
    'sun-vesta': "What sacred work calls your identity? How does devotion shape who you are?",
    'moon-vesta': "What do you feel devoted to? Where do emotions meet sacred focus?"
  };
  
  const key = `${transitPlanet.toLowerCase()}-${natalPlanet.toLowerCase()}`;
  
  if (prompts[key]) {
    return prompts[key];
  }
  
  const h1 = HOUSE_MEANINGS[transitHouse as keyof typeof HOUSE_MEANINGS];
  const h2 = HOUSE_MEANINGS[natalHouse as keyof typeof HOUSE_MEANINGS];
  
  if (h1 && h2) {
    return `How does your ${h1.short.toLowerCase()} relate to your ${h2.short.toLowerCase()} today? What wants to be integrated?`;
  }
  
  return "How am I experiencing this energy today? What wants attention?";
};

// ============================================================================
// PRACTICAL GUIDANCE FUNCTION
// ============================================================================

const getPracticalGuidance = (
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  transitHouse: number,
  natalHouse: number
): { gifts?: string[]; challenges?: string[]; power?: string[]; todo: string[]; avoid: string[] } => {
  const isEasy = aspect === 'trine' || aspect === 'sextile';
  const isHard = aspect === 'square' || aspect === 'opposition';
  const isMerge = aspect === 'conjunction';
  
  const h1 = HOUSE_MEANINGS[transitHouse as keyof typeof HOUSE_MEANINGS];
  const h2 = HOUSE_MEANINGS[natalHouse as keyof typeof HOUSE_MEANINGS];
  
  const h1Short = h1?.short?.toLowerCase() || 'life areas';
  const h2Short = h2?.short?.toLowerCase() || 'life areas';
  
  if (isEasy) {
    return {
      gifts: [
        `Energy flows naturally between ${h1Short} and ${h2Short}`,
        `Your ${transitPlanet.toLowerCase()} expression supports your ${natalPlanet.toLowerCase()} nature`,
        "Opportunities arise without effort - stay open"
      ],
      todo: [
        `Act in the ${h1Short} area with confidence`,
        "Trust the natural flow - don't overthink",
        `Share your gifts in the ${h2Short} area`
      ],
      avoid: [
        "Taking this ease for granted",
        "Staying passive when opportunity calls",
        "Overthinking what flows naturally"
      ]
    };
  } else if (isHard) {
    return {
      challenges: [
        `Tension between ${h1Short} and ${h2Short}`,
        `Your ${transitPlanet.toLowerCase()} pushes your ${natalPlanet.toLowerCase()} to grow`,
        "Discomfort is the catalyst for breakthrough"
      ],
      todo: [
        "Face the friction head-on - don't avoid it",
        "Use the energy to make needed changes",
        "Find creative solutions to the tension"
      ],
      avoid: [
        "Running from the discomfort",
        "Blaming others for the challenge",
        "Staying stuck in the frustration"
      ]
    };
  } else if (isMerge) {
    return {
      power: [
        `${transitPlanet} and ${natalPlanet} merge into one force`,
        `Intensity in both ${h1Short} and ${h2Short}`,
        "New beginning or powerful culmination"
      ],
      todo: [
        "Harness this concentrated power wisely",
        "Start something new or complete something major",
        "Be conscious of the intensity"
      ],
      avoid: [
        "Being overwhelmed by the power",
        "Acting unconsciously with this energy",
        "Ignoring the opportunity"
      ]
    };
  }
  
  return {
    todo: ["Stay aware of this energy", "Journal about what comes up"],
    avoid: ["Ignoring the transit"]
  };
};

// ============================================================================
// MAIN DETAILED INTERPRETATION INTERFACE
// ============================================================================

export interface DetailedInterpretation {
  header: string;
  exactText: string;
  
  // What's Happening section
  transitEssence: string;
  natalEssence: string;
  aspectEnergy: string;
  aspectDescription: string;
  
  // Signs section
  transitSignInfo: string;
  natalSignInfo: string;
  signCombination: string;
  
  // Houses section
  transitHouseShort: string;
  transitHouseFull: string;
  natalHouseShort: string;
  natalHouseFull: string;
  houseConnection: string;
  
  // Practical section
  guidance: {
    gifts?: string[];
    challenges?: string[];
    power?: string[];
    todo: string[];
    avoid: string[];
  };
  
  // Journal
  journalPrompt: string;
}

// ============================================================================
// MAIN INTERPRETATION FUNCTION
// ============================================================================

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
  const transit = PLANET_ESSENCES[transitPlanet.toLowerCase()];
  const natal = PLANET_ESSENCES[natalPlanet.toLowerCase()];
  const aspectInfo = ASPECT_MEANINGS[aspect];
  
  const tH = transitHouse || 1;
  const nH = natalHouse || 1;
  const transitHouseInfo = HOUSE_MEANINGS[tH as keyof typeof HOUSE_MEANINGS];
  const natalHouseInfo = HOUSE_MEANINGS[nH as keyof typeof HOUSE_MEANINGS];
  
  const orbNum = parseFloat(orb);
  
  return {
    header: `Transit ${transit?.name || transitPlanet} (${transitDegree}° ${transitSign}${transitHouse ? `, ${transitHouse}H` : ""}) ${aspect}s Natal ${natal?.name || natalPlanet} (${natalDegree}° ${natalSign}${natalHouse ? `, ${natalHouse}H` : ""})`,
    exactText: orbNum < 1 ? '⭐ EXACT - Maximum power!' : `Orb: ${orb}°`,
    
    // What's Happening
    transitEssence: transit ? `${transit.symbol} ${transit.name.toUpperCase()}: ${transit.essence}` : `${transitPlanet} energy is active.`,
    natalEssence: natal ? `${natal.symbol} ${natal.name.toUpperCase()}: ${natal.essence}` : `Your ${natalPlanet} is activated.`,
    aspectEnergy: aspectInfo?.energy || aspect,
    aspectDescription: aspectInfo?.description || `${aspect} aspect`,
    
    // Signs
    transitSignInfo: `Transit ${transit?.name || transitPlanet} in ${transitSign.toUpperCase()} ${getSignExpression(transit?.name || transitPlanet, transitSign)}`,
    natalSignInfo: `Natal ${natal?.name || natalPlanet} in ${natalSign.toUpperCase()} ${getSignExpression(natal?.name || natalPlanet, natalSign)}`,
    signCombination: getSignCombination(transitSign, natalSign),
    
    // Houses
    transitHouseShort: transitHouseInfo?.short || `${tH}${getOrdinal(tH)} House`,
    transitHouseFull: transitHouseInfo?.full || "",
    natalHouseShort: natalHouseInfo?.short || `${nH}${getOrdinal(nH)} House`,
    natalHouseFull: natalHouseInfo?.full || "",
    houseConnection: getHouseToHouseMeaning(tH, nH, aspectInfo?.meaning || aspect),
    
    // Practical
    guidance: getPracticalGuidance(transitPlanet, natalPlanet, aspect, tH, nH),
    
    // Journal
    journalPrompt: getJournalPrompt(transitPlanet, natalPlanet, tH, nH)
  };
};
