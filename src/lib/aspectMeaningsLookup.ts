/**
 * Deterministic aspect-pair meaning lookup.
 * These are pre-computed sentences based on traditional astrology so the AI
 * never has to hallucinate what an aspect means.
 */

// Key format: "planet1-aspect-planet2" (lowercase, alphabetical planet order)
// We store both directions so lookup is simple.

const ASPECT_MEANINGS: Record<string, string> = {
  // ── SUN ──
  'sun-conjunction-moon': 'New Moon energy — fresh emotional beginnings, seed-planting time. Inner and outer selves merge.',
  'sun-sextile-moon': 'Easy flow between willpower and feelings. A harmonious, productive emotional day.',
  'sun-square-moon': 'Tension between what you want and what you need. Inner friction that demands honest self-assessment.',
  'sun-trine-moon': 'Emotional ease and confidence. You feel at home in yourself today.',
  'sun-opposition-moon': 'Full Moon polarity — awareness peaks, relationships mirror what needs balancing.',

  'sun-conjunction-mercury': 'Cazimi or combust Mercury — either brilliant clarity or mental overwhelm depending on orb.',
  'sun-conjunction-venus': 'Heart and identity merge — a day for self-expression, beauty, and knowing what you love.',
  'sun-conjunction-mars': 'Willpower surges. Bold action, strong ego drive. Watch for aggression.',
  'sun-conjunction-jupiter': 'Confidence expands. Optimism, generosity, a "big day" feeling.',
  'sun-conjunction-saturn': 'Reality check. Responsibility weighs heavily but maturity deepens.',
  'sun-conjunction-uranus': 'Sudden identity shift or breakthrough. Expect the unexpected about who you are.',
  'sun-conjunction-neptune': 'Identity dissolves into imagination. Inspired but potentially confused about direction.',
  'sun-conjunction-pluto': 'Deep power surfaces. Transformation of identity, confronting shadows.',

  'sun-sextile-mars': 'Productive energy. Good day for getting things done with confidence.',
  'sun-sextile-jupiter': 'Lucky break energy. Opportunities flow naturally if you stay open.',
  'sun-sextile-saturn': 'Disciplined progress. Good for planning, building, organizing.',
  'sun-sextile-uranus': 'Creative spark. Fresh ideas come easily — act on inspiration.',
  'sun-sextile-neptune': 'Spiritual insight flows gently. Good for meditation, art, compassion.',
  'sun-sextile-pluto': 'Quiet empowerment. You can influence situations with subtle strength.',

  'sun-square-mars': 'Frustration and friction. Energy needs an outlet — exercise helps. Watch temper.',
  'sun-square-jupiter': 'Overconfidence or overcommitting. Good intentions, poor limits.',
  'sun-square-saturn': 'Feeling blocked or burdened. Authority issues surface. Patience required.',
  'sun-square-uranus': 'Restlessness and rebellion. Something wants to break free.',
  'sun-square-neptune': 'Confusion about identity or purpose. Escapism tempting. Stay grounded.',
  'sun-square-pluto': 'Power struggles. Something hidden demands to be faced. Intense but transformative.',

  'sun-trine-mars': 'Vitality and confidence flow. Excellent for physical activity and leadership.',
  'sun-trine-jupiter': 'Abundance and optimism. Things expand naturally. A feel-good day.',
  'sun-trine-saturn': 'Steady, reliable energy. Good for long-term planning and commitments.',
  'sun-trine-uranus': 'Inspiration and originality come easily. Embrace what makes you different.',
  'sun-trine-neptune': 'Creative and spiritual flow. Imagination is vivid and accessible.',
  'sun-trine-pluto': 'Inner power is accessible. Good for deep work and transformation.',

  'sun-opposition-mars': 'Conflict with others mirrors inner tension. Channel aggression constructively.',
  'sun-opposition-jupiter': 'Big promises, inflated expectations. Check if your reach exceeds your grasp.',
  'sun-opposition-saturn': 'Authority confrontation. Feeling restricted by others. Take responsibility.',
  'sun-opposition-uranus': 'Sudden disruptions to identity or plans. Others bring unexpected change.',
  'sun-opposition-neptune': 'Others may deceive or confuse you. Boundaries dissolve — stay alert.',
  'sun-opposition-pluto': 'Power dynamics with others intensify. Manipulation possible. Stand in your truth.',

  // ── MOON ──
  'moon-conjunction-mercury': 'Mind and emotions merge. Conversations feel personal. Good for journaling.',
  'moon-conjunction-venus': 'Emotional warmth and desire for beauty, love, comfort. A sweet mood.',
  'moon-conjunction-mars': 'Emotional intensity rises. Reactions are quick and passionate. Channel actively.',
  'moon-conjunction-jupiter': 'Emotional generosity and optimism. Feeling blessed and expansive.',
  'moon-conjunction-saturn': 'Emotional heaviness or seriousness. Melancholy possible but productive for discipline.',
  'moon-conjunction-uranus': 'Emotional surprises. Restlessness, sudden mood shifts, craving freedom.',
  'moon-conjunction-neptune': 'Heightened intuition and sensitivity. Dreams vivid. Boundaries thin.',
  'moon-conjunction-pluto': 'Deep emotional undercurrents surface. Intense feelings demand processing.',

  'moon-sextile-mercury': 'Easy communication about feelings. Good for heartfelt conversations.',
  'moon-sextile-venus': 'Pleasant social energy. Harmony in relationships. Enjoy beauty.',
  'moon-sextile-mars': 'Emotional motivation. Good for tackling things that require both heart and action.',
  'moon-sextile-jupiter': 'Emotional optimism. Generosity and good humor flow naturally.',
  'moon-sextile-saturn': 'Emotional maturity. Good for handling responsibilities with calm.',
  'moon-sextile-uranus': 'Pleasant emotional surprises. Open to new experiences and perspectives.',
  'moon-sextile-neptune': 'Intuitive flow. Good for meditation, creative work, and compassion.',
  'moon-sextile-pluto': 'Subtle emotional empowerment. You sense what\'s beneath the surface.',

  'moon-square-mercury': 'Mind-heart disconnect. Overthinking feelings or intellectualizing emotions.',
  'moon-square-venus': 'Tension between needs and desires. Indulgence vs. self-care conflict.',
  'moon-square-mars': 'Irritability and emotional reactivity. Anger surfaces quickly. Breathe first.',
  'moon-square-jupiter': 'Emotional excess. Overeating, overspending, overcommitting. Know your limits.',
  'moon-square-saturn': 'Emotional restriction. Feeling unsupported or lonely. This too shall pass.',
  'moon-square-uranus': 'Emotional disruption. Sudden mood swings, desire to break routines.',
  'moon-square-neptune': 'Confusion and emotional fog. Hard to tell intuition from wishful thinking.',
  'moon-square-pluto': 'Emotional power struggles. Deep feelings surface whether you want them to or not.',

  'moon-trine-mercury': 'Thoughts and feelings align. Excellent for writing, learning, conversations.',
  'moon-trine-venus': 'Emotional warmth and beauty. Relationships feel nurturing. Self-care day.',
  'moon-trine-mars': 'Emotional courage. You feel motivated and ready to act from the heart.',
  'moon-trine-jupiter': 'Emotional abundance. Generosity, faith, and good feelings flow.',
  'moon-trine-saturn': 'Emotional stability. Good for organizing, planning, grounding yourself.',
  'moon-trine-uranus': 'Exciting emotional insights. You feel free and inspired.',
  'moon-trine-neptune': 'Deep intuitive connection. Creative and spiritual awareness heightened.',
  'moon-trine-pluto': 'Emotional depth without overwhelm. Good for therapy, journaling, inner work.',

  'moon-opposition-mercury': 'Head vs. heart. Rational mind and emotional needs pull in opposite directions.',
  'moon-opposition-venus': 'Relationship tension. What you feel vs. what you want are at odds.',
  'moon-opposition-mars': 'Emotional confrontation. Anger may boil over. Others push your buttons.',
  'moon-opposition-jupiter': 'Emotional inflation. Things feel bigger than they are. Perspective needed.',
  'moon-opposition-saturn': 'Feeling emotionally shut out or burdened. Loneliness or duty weighs heavy.',
  'moon-opposition-uranus': 'Emotional volatility from external disruption. Others surprise you.',
  'moon-opposition-neptune': 'Emotional confusion in relationships. Projection and idealization active.',
  'moon-opposition-pluto': 'Intense emotional confrontation. Power dynamics surface in relationships.',

  // ── MERCURY ──
  'mercury-conjunction-venus': 'Sweet communication. Good for love letters, diplomacy, creative writing.',
  'mercury-conjunction-mars': 'Sharp tongue, quick mind. Debates energized. Watch for arguments.',
  'mercury-conjunction-jupiter': 'Big ideas and expansive thinking. Good for planning, teaching, publishing.',
  'mercury-conjunction-saturn': 'Serious, focused thinking. Good for contracts and difficult conversations.',
  'mercury-conjunction-uranus': 'Mental lightning bolts. Brilliant insights arrive suddenly. Revolutionary ideas.',
  'mercury-conjunction-neptune': 'Thinking becomes impressionistic. Intuition speaks louder than logic. Dreams significant.',
  'mercury-conjunction-pluto': 'Penetrating mental focus. Research, investigation, uncovering secrets.',

  'mercury-sextile-venus': 'Charming communication. Good for socializing, art appreciation, negotiations.',
  'mercury-sextile-mars': 'Mental sharpness with productive energy. Good for debates and problem-solving.',
  'mercury-sextile-jupiter': 'Optimistic thinking. Good for learning, travel plans, philosophical discussion.',
  'mercury-sextile-saturn': 'Practical thinking. Good for organization, paperwork, detailed planning.',
  'mercury-sextile-uranus': 'Fresh perspectives arrive easily. Technology and innovation favored.',
  'mercury-sextile-neptune': 'Imagination and communication blend. Good for poetry, music, spiritual reading.',
  'mercury-sextile-pluto': 'Mental depth. Good for research, psychology, strategic thinking.',

  'mercury-square-mars': 'Verbal conflicts likely. Impatience in communication. Think before speaking.',
  'mercury-square-jupiter': 'Exaggeration and overcommitting through words. Check the fine print.',
  'mercury-square-saturn': 'Mental blocks or negative thinking. Communication feels heavy or restricted.',
  'mercury-square-uranus': 'Mental restlessness. Repetitive thoughts indicate stuck energy needing to move. Ask: "Is there a way to look at this differently?"',
  'mercury-square-neptune': 'Miscommunication and confusion. Double-check facts. Not the day for contracts.',
  'mercury-square-pluto': 'Obsessive thinking or verbal power plays. Mind goes to dark places.',

  'mercury-trine-mars': 'Assertive, clear communication. Good for negotiations and presentations.',
  'mercury-trine-jupiter': 'Expansive, positive thinking. Teaching and learning flow.',
  'mercury-trine-saturn': 'Disciplined, practical thinking. Good for serious planning and strategy.',
  'mercury-trine-uranus': 'Innovative ideas flow freely. Breakthroughs in understanding.',
  'mercury-trine-neptune': 'Inspired communication. Poetry, music, spiritual insights come easily.',
  'mercury-trine-pluto': 'Deep understanding. Good for research, therapy, transformative conversations.',

  'mercury-opposition-mars': 'Arguments and verbal sparring. Others challenge your ideas.',
  'mercury-opposition-jupiter': 'Disagreements about beliefs or philosophy. Avoid preaching.',
  'mercury-opposition-saturn': 'Communication meets resistance. Authority figures may block your ideas.',
  'mercury-opposition-uranus': 'Unexpected news or disruptions. Others bring shocking information.',
  'mercury-opposition-neptune': 'Deception possible. Others may mislead. Verify everything.',
  'mercury-opposition-pluto': 'Mental power struggles. Others try to control the narrative.',

  // ── VENUS ──
  'venus-conjunction-mars': 'Passion ignites. Love and desire merge. Creative and romantic intensity.',
  'venus-conjunction-jupiter': 'Love and abundance overflow. Generosity, indulgence, big-hearted connections.',
  'venus-conjunction-saturn': 'Love gets serious. Commitment, loyalty, or feeling unloved surfaces.',
  'venus-conjunction-uranus': 'Unexpected attraction or creative breakthrough. Love surprises.',
  'venus-conjunction-neptune': 'Romantic idealism peaks. Beautiful but potentially illusory. Art inspired.',
  'venus-conjunction-pluto': 'Intense, transformative love experiences. Obsession possible. Deep beauty.',

  'venus-sextile-mars': 'Balanced passion. Good for romance, socializing, and creative projects.',
  'venus-sextile-jupiter': 'Social grace and abundance. Good for celebrations, gifts, generosity.',
  'venus-sextile-saturn': 'Stable affection. Good for commitments and practical relationship steps.',
  'venus-sextile-uranus': 'A subtle shake-up in relationships or values — unexpected beauty, creative sparks, or a surprising connection. Exciting but gentle.',
  'venus-sextile-neptune': 'Romantic inspiration. Art, music, and compassion flow beautifully.',
  'venus-sextile-pluto': 'Magnetic attraction or deepening of bonds. Quiet intensity.',

  'venus-square-mars': 'Tension between love and lust, cooperation and competition. Passionate friction.',
  'venus-square-jupiter': 'Overindulgence in pleasure. Spending too much, eating too much, promising too much.',
  'venus-square-saturn': 'Feeling unloved or unworthy. Relationship delays or coldness.',
  'venus-square-uranus': 'Relationship instability. Craving freedom vs. commitment. Sudden attractions.',
  'venus-square-neptune': 'Romantic disillusionment. Seeing people as they are, not as you wish.',
  'venus-square-pluto': 'Jealousy, possessiveness, or obsessive attraction. Power dynamics in love.',

  'venus-trine-mars': 'Harmonious desire. Excellent for romance, creativity, and enjoyment.',
  'venus-trine-jupiter': 'Love and luck combine. Great social energy, generosity, celebration.',
  'venus-trine-saturn': 'Enduring love. Good for long-term commitments and practical beauty.',
  'venus-trine-uranus': 'Exciting and refreshing relationship energy. Creative breakthroughs.',
  'venus-trine-neptune': 'Transcendent beauty and love. Artistic and spiritual inspiration.',
  'venus-trine-pluto': 'Deep, transformative love. Bonds deepen. Creative power.',

  'venus-opposition-mars': 'Attraction and conflict intertwine. Others provoke desire and frustration.',
  'venus-opposition-jupiter': 'Excess in relationships or spending. Others promise more than they deliver.',
  'venus-opposition-saturn': 'Relationship coldness or duty. Feeling rejected or restricted in love.',
  'venus-opposition-uranus': 'Relationship shakeups from outside. Partners surprise or destabilize.',
  'venus-opposition-neptune': 'Deception in love. Idealization meets reality. Boundaries needed.',
  'venus-opposition-pluto': 'Intense relationship confrontation. Power and control issues surface.',

  // ── MARS ──
  'mars-conjunction-jupiter': 'Ambitious action and expansion. Great energy for starting ventures.',
  'mars-conjunction-saturn': 'Controlled action. Frustration that builds discipline. Patience needed.',
  'mars-conjunction-uranus': 'Explosive energy. Sudden action, accidents possible. Breakthrough or breakdown.',
  'mars-conjunction-neptune': 'Inspired action or confused motivation. Fight for ideals — or fight phantoms.',
  'mars-conjunction-pluto': 'Extreme willpower. Transformative action. Power surge. Handle with care.',

  'mars-sextile-jupiter': 'Confident action that pays off. Good for entrepreneurship and sports.',
  'mars-sextile-saturn': 'Disciplined energy. Good for hard work, building, endurance tasks.',
  'mars-sextile-uranus': 'Exciting initiatives. Good for trying new approaches and innovation.',
  'mars-sextile-neptune': 'Action inspired by ideals. Good for creative work and compassionate service.',
  'mars-sextile-pluto': 'Strategic power. Good for research, investigation, focused effort.',

  'mars-square-jupiter': 'Overextension of energy. Taking on too much. Reckless confidence.',
  'mars-square-saturn': 'Frustration and blocked energy. Like driving with the brakes on.',
  'mars-square-uranus': 'Volatile energy. Accidents, arguments, sudden disruptions. Stay alert.',
  'mars-square-neptune': 'Misdirected energy. Acting on false information. Escapism through action.',
  'mars-square-pluto': 'Power struggles intensify. Ruthlessness or manipulation. Choose your battles.',

  'mars-trine-jupiter': 'Enthusiastic, successful action. Everything flows toward growth.',
  'mars-trine-saturn': 'Sustained, productive effort. Excellent for completing difficult tasks.',
  'mars-trine-uranus': 'Dynamic energy for innovation and change. Exciting breakthroughs.',
  'mars-trine-neptune': 'Inspired action. Creative energy flows. Fighting for what matters.',
  'mars-trine-pluto': 'Powerful, focused determination. Transformation through action.',

  'mars-opposition-jupiter': 'Others challenge your ambitions. Legal or philosophical conflicts.',
  'mars-opposition-saturn': 'Authority blocks your action. Frustration with restrictions.',
  'mars-opposition-uranus': 'Others bring sudden confrontation. Expect the unexpected.',
  'mars-opposition-neptune': 'Others confuse your intentions. Passive-aggressive dynamics.',
  'mars-opposition-pluto': 'Power battles with others. Intense confrontation or transformation.',

  // ── OUTER PLANETS (slower, longer-lasting) ──
  'jupiter-conjunction-saturn': 'Great Conjunction — new 20-year cycle begins. Society restructures.',
  'jupiter-conjunction-uranus': 'Sudden expansion and breakthrough. Revolutionary opportunities.',
  'jupiter-conjunction-neptune': 'Spiritual expansion peaks. Idealism, faith, collective dreams amplified.',
  'jupiter-conjunction-pluto': 'Massive transformation of power structures. Wealth redistribution.',
  'jupiter-sextile-saturn': 'Balanced growth and discipline. Good for business and institutional progress.',
  'jupiter-sextile-uranus': 'Progressive opportunities. Innovation meets expansion.',
  'jupiter-sextile-neptune': 'Spiritual growth through gentle expansion. Compassion and faith deepen.',
  'jupiter-sextile-pluto': 'Empowerment through expansion. Strategic growth and influence.',
  'jupiter-square-saturn': 'Growth vs. limitation clash. Society debates expansion vs. austerity.',
  'jupiter-square-uranus': 'Tension between tradition and revolution. Sudden societal shifts.',
  'jupiter-square-neptune': 'Collective disillusionment. Faith tested. Beware of false promises.',
  'jupiter-square-pluto': 'Power and excess clash. Societal power dynamics under pressure.',
  'jupiter-trine-saturn': 'Sustainable growth. Institutions mature. Balanced expansion.',
  'jupiter-trine-uranus': 'Innovation and growth align. Lucky breakthroughs for society.',
  'jupiter-trine-neptune': 'Spiritual and cultural renaissance. Art, music, and faith flourish.',
  'jupiter-trine-pluto': 'Transformative empowerment. Deep social change in positive directions.',
  'jupiter-opposition-saturn': 'Growth and restriction in standoff. Society at a crossroads.',
  'jupiter-opposition-uranus': 'Freedom vs. excess. Sudden reversals of fortune.',
  'jupiter-opposition-neptune': 'Reality vs. idealism. Collective disillusionment or spiritual crisis.',
  'jupiter-opposition-pluto': 'Power confrontation. Wealth and influence battle for dominance.',

  'saturn-conjunction-uranus': 'Old structures meet revolution. Tense but potentially brilliant reconfiguration.',
  'saturn-conjunction-neptune': 'Dreams crystallize or dissolve. Reality and fantasy merge.',
  'saturn-conjunction-pluto': 'Massive structural transformation. Institutions die and are reborn.',
  'saturn-sextile-uranus': 'Innovation within structure. Practical reform and progress.',
  'saturn-sextile-neptune': 'Spiritual discipline. Grounding dreams into reality.',
  'saturn-sextile-pluto': 'Strategic transformation. Rebuilding power structures methodically.',
  'saturn-square-uranus': 'Freedom vs. control. The old guard clashes with the new.',
  'saturn-square-neptune': 'Reality erodes ideals. Disillusionment with institutions.',
  'saturn-square-pluto': 'Power structures under extreme stress. Breakdown before breakthrough.',
  'saturn-trine-uranus': 'Progressive stability. Innovation works within the system.',
  'saturn-trine-neptune': 'Practical spirituality. Dreams given form and structure.',
  'saturn-trine-pluto': 'Deep, lasting structural change. Transformation that endures.',
  'saturn-opposition-uranus': 'Authority vs. rebellion. Society torn between old and new.',
  'saturn-opposition-neptune': 'Harsh reality vs. escapism. Institutions face dissolving forces.',
  'saturn-opposition-pluto': 'Power structures face existential crisis. Total transformation demanded.',

  'uranus-conjunction-neptune': 'Generational awakening of consciousness (once per ~170 years).',
  'uranus-conjunction-pluto': 'Revolutionary transformation (once per ~110-140 years). Upheaval and rebirth.',
  'uranus-sextile-neptune': 'Generational bridge between innovation and spirituality.',
  'uranus-sextile-pluto': 'Progressive transformation. Technology drives social evolution.',
  'uranus-square-neptune': 'Ideals shattered. Technology disrupts spirituality. Cultural dissonance.',
  'uranus-square-pluto': 'Revolutionary upheaval. Power structures violently disrupted.',
  'uranus-trine-neptune': 'Harmonious awakening. Technology and spirituality find common ground.',
  'uranus-trine-pluto': 'Evolutionary transformation flows. Deep change without destruction.',
  'uranus-opposition-neptune': 'Innovation vs. dissolution. Technology clashes with spiritual values.',
  'uranus-opposition-pluto': 'Radical confrontation with power. Revolutionary crisis.',

  'neptune-conjunction-pluto': 'Once per ~493 years. Total dissolution and rebirth of civilization cycles.',
  'neptune-sextile-pluto': 'Generational spiritual transformation. Cultural evolution through dreams.',
  'neptune-square-pluto': 'Spiritual vs. power crisis. Collective shadow confrontation.',
  'neptune-trine-pluto': 'Transformative dreams. Collective evolution through imagination.',
  'neptune-opposition-pluto': 'Ultimate polarity — dissolution vs. regeneration.',
};

// Minor aspects
const MINOR_ASPECT_MEANINGS: Record<string, string> = {
  'quincunx': 'An awkward tension requiring adjustment — two energies that don\'t naturally understand each other must find a creative workaround.',
  'semisextile': 'A subtle, background connection — barely noticeable but provides a gentle bridge between two areas of life.',
};

/**
 * Look up the deterministic meaning for a planet-aspect pair.
 * Returns a pre-written sentence that the AI should use verbatim.
 */
export function getAspectMeaning(planet1: string, planet2: string, aspectType: string): string | null {
  // Normalize to lowercase
  const p1 = planet1.toLowerCase();
  const p2 = planet2.toLowerCase();
  const aspect = aspectType.toLowerCase();

  // Try both orderings
  const key1 = `${p1}-${aspect}-${p2}`;
  const key2 = `${p2}-${aspect}-${p1}`;

  const meaning = ASPECT_MEANINGS[key1] || ASPECT_MEANINGS[key2];
  if (meaning) return meaning;

  // Fallback for minor aspects
  if (MINOR_ASPECT_MEANINGS[aspect]) {
    const planetNames: Record<string, string> = {
      sun: 'Sun (identity, vitality)', moon: 'Moon (emotions, needs)',
      mercury: 'Mercury (mind, communication)', venus: 'Venus (love, beauty, values)',
      mars: 'Mars (action, drive)', jupiter: 'Jupiter (expansion, faith)',
      saturn: 'Saturn (discipline, responsibility)', uranus: 'Uranus (change, innovation)',
      neptune: 'Neptune (dreams, intuition)', pluto: 'Pluto (transformation, power)',
    };
    return `${planetNames[p1] || p1} ${aspect} ${planetNames[p2] || p2}: ${MINOR_ASPECT_MEANINGS[aspect]}`;
  }

  return null;
}

/**
 * Build a dispositorship chain for the Moon.
 * e.g., Moon in Libra → Venus rules → Venus in Pisces → Jupiter/Neptune rule
 */
export function getMoonDispositorChain(
  moonSign: string,
  planetPositions: Array<{ name: string; sign: string; degree: string | number }>
): string {
  const SIGN_RULERS: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
    Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
    Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
  };

  const MODERN_RULERS: Record<string, string> = {
    Scorpio: 'Pluto', Aquarius: 'Uranus', Pisces: 'Neptune',
  };

  const getSign = (planetName: string): string | null => {
    const p = planetPositions.find(pp => pp.name.toLowerCase() === planetName.toLowerCase());
    return p?.sign || null;
  };

  const chain: string[] = [];
  let currentSign = moonSign;
  const visited = new Set<string>();

  // Build chain up to 4 levels deep
  for (let i = 0; i < 4; i++) {
    const ruler = SIGN_RULERS[currentSign];
    if (!ruler || visited.has(ruler)) break;
    visited.add(ruler);

    const rulerSign = getSign(ruler);
    if (!rulerSign) break;

    const modernRuler = MODERN_RULERS[currentSign];
    const modernNote = modernRuler && modernRuler !== ruler
      ? ` (modern ruler: ${modernRuler})`
      : '';

    chain.push(`${ruler}${modernNote} rules ${currentSign}, and ${ruler} is in ${rulerSign}`);

    if (ruler.toLowerCase() === 'moon' || rulerSign === currentSign) {
      // Moon rules Cancer = domicile, or planet in own sign = chain ends
      chain.push(`${ruler} is in its own domain — the buck stops here`);
      break;
    }

    currentSign = rulerSign;
  }

  if (chain.length === 0) return '';

  return `MOON DISPOSITORSHIP CHAIN: Moon in ${moonSign} → ${chain.join(' → ')}. This shows WHERE the Moon's emotional energy ultimately flows today.`;
}

/**
 * Build pre-computed aspect sentences for all current aspects.
 */
export function buildAspectNarrative(
  aspects: Array<{ planet1: string; planet2: string; type: string; orb: string; symbol?: string; motion?: string }>
): string {
  if (!aspects || aspects.length === 0) return '';

  const lines: string[] = [];

  for (const asp of aspects) {
    const meaning = getAspectMeaning(asp.planet1, asp.planet2, asp.type);
    if (meaning) {
      const orbNum = parseFloat(asp.orb);
      const tightness = orbNum < 1 ? '(EXACT — very powerful)' : orbNum < 2 ? '(tight — strongly felt)' : orbNum < 4 ? '(active)' : '(wide — background influence)';
      const motionText = asp.motion === 'applying' ? 'APPLYING (building)' : asp.motion === 'separating' ? 'SEPARATING (releasing)' : '';
      lines.push(`• ${asp.planet1} ${asp.symbol || asp.type} ${asp.planet2} ${tightness} ${motionText}: ${meaning}`);
    }
  }

  if (lines.length === 0) return '';

  return `ASPECT MEANINGS (GROUND TRUTH — use these interpretations, do NOT substitute your own):\n${lines.join('\n')}`;
}
