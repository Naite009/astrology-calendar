/**
 * Planetary Combinations Database
 * 
 * This module contains interpretations for planet-sign, planet-house,
 * planet-planet aspects, and multi-factor combinations.
 * 
 * Each entry provides 1-10 "energies" - both light and shadow expressions.
 */

export interface CombinationEntry {
  id: string;
  factors: string[]; // e.g., ['Mercury', 'Taurus'] or ['Mars', 'Pluto', '8th House']
  title: string;
  summary: string;
  energies: {
    expression: string;
    polarity: 'light' | 'shadow' | 'neutral';
  }[];
  sources?: string[];
  tags?: string[];
}

// ============== PLANET-SIGN COMBINATIONS ==============

export const planetSignCombinations: CombinationEntry[] = [
  // MERCURY
  {
    id: 'mercury-taurus',
    factors: ['Mercury', 'Taurus'],
    title: 'The Deliberate Mind',
    summary: 'Mercury in Taurus creates a slow, methodical thinking process that prizes practical wisdom over quick wit. Associated with the Five of Pentacles in Tarot, this combination can manifest as "poverty consciousness" - a mental fixation on material security - but also grants remarkable powers of concentration and sensory intelligence.',
    energies: [
      { expression: 'Mental fixation on material security or "poverty consciousness"', polarity: 'shadow' },
      { expression: 'Slow, deliberate thinking that catches what others miss', polarity: 'light' },
      { expression: 'Exceptional memory, especially for sensory experiences', polarity: 'light' },
      { expression: 'Stubborn thinking patterns resistant to new information', polarity: 'shadow' },
      { expression: 'Thoughtful listener who truly absorbs what others say', polarity: 'light' },
      { expression: 'Voice often has a soothing, melodic quality', polarity: 'light' },
      { expression: 'Practical intelligence over abstract theorizing', polarity: 'neutral' },
      { expression: 'Talent for craftsmanship, building, or artistic creation', polarity: 'light' },
      { expression: 'Can become mentally "stuck" in worry loops about resources', polarity: 'shadow' },
      { expression: 'Learning through hands-on experience rather than books', polarity: 'neutral' },
    ],
    sources: ['Golden Dawn Tarot Correspondences', 'Traditional Astrology'],
    tags: ['tarot', 'fixed', 'earth', 'poverty-consciousness'],
  },
  {
    id: 'mercury-aries',
    factors: ['Mercury', 'Aries'],
    title: 'The Quick Blade',
    summary: 'Mercury in Aries thinks at lightning speed, often speaking before fully processing. The mind is sharp, direct, and competitive. Ideas come as sudden flashes of insight.',
    energies: [
      { expression: 'Rapid-fire thinking and speaking', polarity: 'neutral' },
      { expression: 'Pioneering ideas that cut through confusion', polarity: 'light' },
      { expression: 'Impatience with slow communicators', polarity: 'shadow' },
      { expression: 'Debate skills - loves mental combat', polarity: 'neutral' },
      { expression: 'Speaks before thinking, can wound with words', polarity: 'shadow' },
      { expression: 'Courage to voice unpopular opinions', polarity: 'light' },
      { expression: 'Short attention span for boring details', polarity: 'shadow' },
      { expression: 'Initiates conversations and ideas', polarity: 'light' },
    ],
    tags: ['cardinal', 'fire', 'quick'],
  },
  {
    id: 'mercury-gemini',
    factors: ['Mercury', 'Gemini'],
    title: 'The Messenger',
    summary: 'Mercury in its home sign of Gemini is endlessly curious, verbally gifted, and intellectually versatile. The mind is a hummingbird, darting from topic to topic.',
    energies: [
      { expression: 'Exceptional verbal and written communication', polarity: 'light' },
      { expression: 'Intellectual curiosity about everything', polarity: 'light' },
      { expression: 'Difficulty focusing on one topic deeply', polarity: 'shadow' },
      { expression: 'Witty, clever humor', polarity: 'light' },
      { expression: 'Can talk their way into or out of anything', polarity: 'neutral' },
      { expression: 'Nervousness from mental overstimulation', polarity: 'shadow' },
      { expression: 'Natural teacher or translator', polarity: 'light' },
      { expression: 'May stretch truth for a good story', polarity: 'shadow' },
    ],
    tags: ['mutable', 'air', 'domicile'],
  },
  {
    id: 'mercury-cancer',
    factors: ['Mercury', 'Cancer'],
    title: 'The Rememberer',
    summary: 'Mercury in Cancer thinks with emotional intelligence. Memory is tied to feeling - they remember how things felt, not just facts. Communication style is nurturing but can be indirect.',
    energies: [
      { expression: 'Emotional intelligence and intuitive knowing', polarity: 'light' },
      { expression: 'Exceptional memory for emotional experiences', polarity: 'light' },
      { expression: 'Takes criticism very personally', polarity: 'shadow' },
      { expression: 'Nurturing communication style', polarity: 'light' },
      { expression: 'Indirect or moody expression when hurt', polarity: 'shadow' },
      { expression: 'Storytelling ability that moves people', polarity: 'light' },
      { expression: 'Defensive when family/roots are questioned', polarity: 'shadow' },
      { expression: 'Psychic receptivity to others\' thoughts', polarity: 'light' },
    ],
    tags: ['cardinal', 'water', 'emotional-intelligence'],
  },
  {
    id: 'mercury-virgo',
    factors: ['Mercury', 'Virgo'],
    title: 'The Analyst',
    summary: 'Mercury is exalted in Virgo, producing the most precise, analytical mind. Exceptional at categorizing, editing, and perfecting information. Can become overly critical.',
    energies: [
      { expression: 'Precision thinking and attention to detail', polarity: 'light' },
      { expression: 'Natural editor - sees what needs improvement', polarity: 'light' },
      { expression: 'Overcritical of self and others', polarity: 'shadow' },
      { expression: 'Health consciousness and body awareness', polarity: 'light' },
      { expression: 'Anxiety from overanalyzing', polarity: 'shadow' },
      { expression: 'Excellent troubleshooter', polarity: 'light' },
      { expression: 'May miss the forest for the trees', polarity: 'shadow' },
      { expression: 'Service-oriented communication', polarity: 'light' },
    ],
    tags: ['mutable', 'earth', 'exalted'],
  },
  
  // VENUS
  {
    id: 'venus-scorpio',
    factors: ['Venus', 'Scorpio'],
    title: 'The Obsessive Heart',
    summary: 'Venus in detriment in Scorpio loves with terrifying intensity. Relationships become all-or-nothing experiences. Jealousy and possessiveness are shadows, but the capacity for transformative love is unmatched.',
    energies: [
      { expression: 'All-or-nothing love that transforms both partners', polarity: 'light' },
      { expression: 'Intense jealousy and possessiveness', polarity: 'shadow' },
      { expression: 'Sexual magnetism and depth', polarity: 'neutral' },
      { expression: 'Difficulty trusting, tests potential partners', polarity: 'shadow' },
      { expression: 'Loyalty unto death once committed', polarity: 'light' },
      { expression: 'Attraction to taboo or forbidden relationships', polarity: 'shadow' },
      { expression: 'Sees through superficial beauty to the soul', polarity: 'light' },
      { expression: 'Can use love as control or manipulation', polarity: 'shadow' },
      { expression: 'Financial acumen - good with shared resources', polarity: 'light' },
      { expression: 'Healing capacity through intimate connection', polarity: 'light' },
    ],
    tags: ['fixed', 'water', 'detriment', 'intense'],
  },
  {
    id: 'venus-taurus',
    factors: ['Venus', 'Taurus'],
    title: 'The Sensualist',
    summary: 'Venus in domicile in Taurus expresses love through the senses - touch, taste, beauty. Steady, loyal affection that builds slowly but endures. Material comfort is essential to feeling loved.',
    energies: [
      { expression: 'Deep appreciation for physical beauty and comfort', polarity: 'light' },
      { expression: 'Steady, reliable love that builds over time', polarity: 'light' },
      { expression: 'Can equate love with material gifts', polarity: 'shadow' },
      { expression: 'Sensual, tactile approach to intimacy', polarity: 'light' },
      { expression: 'Possessiveness of partners and belongings', polarity: 'shadow' },
      { expression: 'Natural talent for creating beauty', polarity: 'light' },
      { expression: 'Resistance to change in relationships', polarity: 'shadow' },
      { expression: 'Financial stability - good with money', polarity: 'light' },
    ],
    tags: ['fixed', 'earth', 'domicile', 'sensual'],
  },
  {
    id: 'venus-libra',
    factors: ['Venus', 'Libra'],
    title: 'The Harmonizer',
    summary: 'Venus in its air domicile seeks beauty in relationships and ideas. Natural diplomat with refined aesthetic sensibilities. May prioritize peace over authenticity.',
    energies: [
      { expression: 'Natural grace in social situations', polarity: 'light' },
      { expression: 'Strong sense of fairness and justice in love', polarity: 'light' },
      { expression: 'Indecisiveness in relationships', polarity: 'shadow' },
      { expression: 'Refined aesthetic taste', polarity: 'light' },
      { expression: 'Avoids conflict at cost of authenticity', polarity: 'shadow' },
      { expression: 'Skilled at creating harmony between people', polarity: 'light' },
      { expression: 'Need for partnership - uncomfortable alone', polarity: 'shadow' },
      { expression: 'Diplomatic communication style', polarity: 'light' },
    ],
    tags: ['cardinal', 'air', 'domicile', 'harmonious'],
  },
  
  // MARS
  {
    id: 'mars-scorpio',
    factors: ['Mars', 'Scorpio'],
    title: 'The Strategist',
    summary: 'Mars in its traditional domicile gives tremendous willpower and strategic capacity. Actions are calculated, intense, and often hidden until the moment of strike.',
    energies: [
      { expression: 'Relentless willpower - never gives up', polarity: 'light' },
      { expression: 'Strategic patience - waits for the right moment', polarity: 'light' },
      { expression: 'Capacity for revenge and grudge-holding', polarity: 'shadow' },
      { expression: 'Sexual intensity and magnetism', polarity: 'neutral' },
      { expression: 'Controlling or manipulative tactics', polarity: 'shadow' },
      { expression: 'Psychological insight into others\' motivations', polarity: 'light' },
      { expression: 'Difficulty forgiving betrayal', polarity: 'shadow' },
      { expression: 'Transformative action - destroys to rebuild', polarity: 'light' },
    ],
    tags: ['fixed', 'water', 'domicile', 'intense'],
  },
  {
    id: 'mars-aries',
    factors: ['Mars', 'Aries'],
    title: 'The Warrior',
    summary: 'Mars in its fiery domicile is pure, direct action. Courage, initiative, and competitive drive are at their peak. Can be too aggressive or impulsive.',
    energies: [
      { expression: 'Courage to act when others hesitate', polarity: 'light' },
      { expression: 'Quick to anger but also quick to forgive', polarity: 'neutral' },
      { expression: 'Physical energy and athletic ability', polarity: 'light' },
      { expression: 'Impulsive actions without considering consequences', polarity: 'shadow' },
      { expression: 'Pioneer spirit - blazes new trails', polarity: 'light' },
      { expression: 'Difficulty with patience or sustained effort', polarity: 'shadow' },
      { expression: 'Competitive drive in all areas of life', polarity: 'neutral' },
      { expression: 'Direct, honest approach - what you see is what you get', polarity: 'light' },
    ],
    tags: ['cardinal', 'fire', 'domicile', 'warrior'],
  },
  {
    id: 'mars-libra',
    factors: ['Mars', 'Libra'],
    title: 'The Diplomat Warrior',
    summary: 'Mars in detriment struggles with direct action. Fights for fairness but can be passive-aggressive. Actions are often taken in partnership or through negotiation.',
    energies: [
      { expression: 'Fights for justice and fairness', polarity: 'light' },
      { expression: 'Passive-aggressive expression of anger', polarity: 'shadow' },
      { expression: 'Actions through partnership rather than alone', polarity: 'neutral' },
      { expression: 'Difficulty with direct confrontation', polarity: 'shadow' },
      { expression: 'Diplomatic tactics to achieve goals', polarity: 'light' },
      { expression: 'Procrastination due to weighing all sides', polarity: 'shadow' },
      { expression: 'Motivated by relationship goals', polarity: 'neutral' },
      { expression: 'Artistic or creative drive', polarity: 'light' },
    ],
    tags: ['cardinal', 'air', 'detriment'],
  },
  
  // JUPITER
  {
    id: 'jupiter-cancer',
    factors: ['Jupiter', 'Cancer'],
    title: 'The Great Nurturer',
    summary: 'Jupiter is exalted in Cancer, expanding emotional wisdom, family blessings, and protective instincts. This placement often indicates inherited wealth or property luck.',
    energies: [
      { expression: 'Generous, nurturing spirit that expands family', polarity: 'light' },
      { expression: 'Luck through real estate, property, or family', polarity: 'light' },
      { expression: 'Emotional wisdom and intuitive faith', polarity: 'light' },
      { expression: 'Can enable family dysfunction through over-giving', polarity: 'shadow' },
      { expression: 'Abundance consciousness - feels secure', polarity: 'light' },
      { expression: 'Tendency toward emotional over-indulgence', polarity: 'shadow' },
      { expression: 'Natural teacher, especially of emotional/spiritual matters', polarity: 'light' },
      { expression: 'Clannish - expands "us vs them" mentality', polarity: 'shadow' },
    ],
    tags: ['cardinal', 'water', 'exalted', 'wealth'],
  },
  {
    id: 'jupiter-sagittarius',
    factors: ['Jupiter', 'Sagittarius'],
    title: 'The Philosopher King',
    summary: 'Jupiter in domicile gives the biggest vision, the most faith, and the greatest need for expansion and meaning. Natural teacher, traveler, and seeker.',
    energies: [
      { expression: 'Expansive optimism and faith in life', polarity: 'light' },
      { expression: 'Love of learning, travel, and adventure', polarity: 'light' },
      { expression: 'Over-promising and under-delivering', polarity: 'shadow' },
      { expression: 'Natural teacher and inspirer', polarity: 'light' },
      { expression: 'Dogmatic about personal beliefs', polarity: 'shadow' },
      { expression: 'Luck through education, publishing, foreign lands', polarity: 'light' },
      { expression: 'Restlessness - difficulty with commitment', polarity: 'shadow' },
      { expression: 'Big-picture thinking, misses details', polarity: 'neutral' },
    ],
    tags: ['mutable', 'fire', 'domicile', 'philosopher'],
  },
  
  // SATURN
  {
    id: 'saturn-capricorn',
    factors: ['Saturn', 'Capricorn'],
    title: 'The Master Builder',
    summary: 'Saturn in domicile gives tremendous capacity for discipline, structure, and long-term achievement. Can be cold, calculating, or overly focused on status.',
    energies: [
      { expression: 'Exceptional discipline and work ethic', polarity: 'light' },
      { expression: 'Strategic patience - builds empires over time', polarity: 'light' },
      { expression: 'Emotional coldness or unavailability', polarity: 'shadow' },
      { expression: 'Natural authority and leadership', polarity: 'light' },
      { expression: 'Excessive focus on status or achievement', polarity: 'shadow' },
      { expression: 'Practical wisdom from experience', polarity: 'light' },
      { expression: 'Difficulty relaxing or enjoying leisure', polarity: 'shadow' },
      { expression: 'Integrity - word is their bond', polarity: 'light' },
    ],
    tags: ['cardinal', 'earth', 'domicile', 'master'],
  },
  {
    id: 'saturn-aquarius',
    factors: ['Saturn', 'Aquarius'],
    title: 'The Reformer',
    summary: 'Saturn in its air domicile channels discipline toward humanitarian or intellectual goals. Creates structures for social change.',
    energies: [
      { expression: 'Disciplined pursuit of humanitarian ideals', polarity: 'light' },
      { expression: 'Systematic, scientific thinking', polarity: 'light' },
      { expression: 'Emotional detachment from personal needs', polarity: 'shadow' },
      { expression: 'Innovation within established frameworks', polarity: 'light' },
      { expression: 'Rigid about personal principles', polarity: 'shadow' },
      { expression: 'Long-term vision for collective improvement', polarity: 'light' },
      { expression: 'Difficulty with intimate one-on-one connection', polarity: 'shadow' },
      { expression: 'Authority earned through expertise', polarity: 'light' },
    ],
    tags: ['fixed', 'air', 'domicile', 'humanitarian'],
  },
  {
    id: 'saturn-cancer',
    factors: ['Saturn', 'Cancer'],
    title: 'The Wounded Nurturer',
    summary: 'Saturn in detriment in Cancer often indicates early family difficulties or emotional restriction. Fear around vulnerability. Must learn to nurture self and others despite walls.',
    energies: [
      { expression: 'Early family responsibilities or hardship', polarity: 'shadow' },
      { expression: 'Difficulty expressing emotional needs', polarity: 'shadow' },
      { expression: 'Becomes excellent caretaker through experience', polarity: 'light' },
      { expression: 'Fear of dependency or vulnerability', polarity: 'shadow' },
      { expression: 'Creates emotional safety through structure', polarity: 'light' },
      { expression: 'Mother wound or maternal responsibility', polarity: 'shadow' },
      { expression: 'Wisdom about emotional boundaries', polarity: 'light' },
      { expression: 'Late bloomer in finding emotional security', polarity: 'neutral' },
    ],
    tags: ['cardinal', 'water', 'detriment', 'family-wound'],
  },
  
  // CHIRON
  {
    id: 'chiron-aries',
    factors: ['Chiron', 'Aries'],
    title: 'The Wounded Identity',
    summary: 'Chiron in Aries carries a wound around identity, assertion, and the right to exist. Heals by helping others find their courage and authentic self.',
    energies: [
      { expression: 'Deep wound around asserting the self', polarity: 'shadow' },
      { expression: 'Helps others find their courage', polarity: 'light' },
      { expression: 'Difficulty taking initiative for self', polarity: 'shadow' },
      { expression: 'Heals through physical action and movement', polarity: 'light' },
      { expression: 'Anger that has been suppressed or misdirected', polarity: 'shadow' },
      { expression: 'Teaches others to fight for themselves', polarity: 'light' },
      { expression: 'May overcompensate with aggression', polarity: 'shadow' },
      { expression: 'Pioneering new approaches to healing', polarity: 'light' },
    ],
    tags: ['cardinal', 'fire', 'identity-wound'],
  },
  {
    id: 'chiron-7th-house',
    factors: ['Chiron', '7th House'],
    title: 'The Wounded Partner',
    summary: 'Chiron in the 7th House indicates wounds around partnership and one-on-one relationships. Often becomes an excellent counselor or healer for others\' relationships.',
    energies: [
      { expression: 'Deep wound from early relationship experiences', polarity: 'shadow' },
      { expression: 'Becomes skilled relationship counselor', polarity: 'light' },
      { expression: 'May attract wounded partners to fix', polarity: 'shadow' },
      { expression: 'Teaches others about healthy partnership', polarity: 'light' },
      { expression: 'Fear of commitment or abandonment', polarity: 'shadow' },
      { expression: 'Heals through partnership experiences', polarity: 'light' },
      { expression: 'Difficulty receiving as well as giving in relationships', polarity: 'shadow' },
      { expression: 'Eventually models healthy relating', polarity: 'light' },
    ],
    tags: ['7th-house', 'relationship-wound', 'healer'],
  },
];

// ============== PLANET-HOUSE COMBINATIONS ==============

export const planetHouseCombinations: CombinationEntry[] = [
  // 8TH HOUSE PLACEMENTS
  {
    id: 'mars-8th-house',
    factors: ['Mars', '8th House'],
    title: 'The Underworld Warrior',
    summary: 'Mars in the 8th House channels drive and aggression into deep psychological territory. Sexual intensity, power struggles, and transformation through crisis.',
    energies: [
      { expression: 'Intense sexual energy and magnetism', polarity: 'neutral' },
      { expression: 'Courage to face death, crisis, or taboo', polarity: 'light' },
      { expression: 'Power struggles in intimate/financial partnerships', polarity: 'shadow' },
      { expression: 'Transformative action - destroys to rebuild', polarity: 'light' },
      { expression: 'Anger that goes underground and erupts explosively', polarity: 'shadow' },
      { expression: 'Drive to investigate hidden or occult matters', polarity: 'light' },
      { expression: 'Can attract or perpetrate power dynamics/control', polarity: 'shadow' },
      { expression: 'Healing capacity through facing shadows', polarity: 'light' },
    ],
    tags: ['8th-house', 'intense', 'transformation'],
  },
  {
    id: 'pluto-8th-house',
    factors: ['Pluto', '8th House'],
    title: 'Lord of the Underworld',
    summary: 'Pluto in its natural house intensifies all 8th house themes: sex, death, shared resources, psychological depth. Tremendous transformative power but also potential for obsession and control.',
    energies: [
      { expression: 'Profound psychological insight', polarity: 'light' },
      { expression: 'Obsession with power, sex, or control', polarity: 'shadow' },
      { expression: 'Ability to transform through crisis', polarity: 'light' },
      { expression: 'Trust issues around shared resources', polarity: 'shadow' },
      { expression: 'Natural healer, therapist, or investigator', polarity: 'light' },
      { expression: 'Potential for manipulation in intimate relationships', polarity: 'shadow' },
      { expression: 'Inheritance or significant wealth through others', polarity: 'neutral' },
      { expression: 'Survives what would destroy others', polarity: 'light' },
    ],
    tags: ['8th-house', 'pluto', 'power', 'transformation'],
  },
  {
    id: 'jupiter-2nd-house',
    factors: ['Jupiter', '2nd House'],
    title: 'The Wealth Expander',
    summary: 'Jupiter in the 2nd House often indicates natural luck with money and resources. Expansive approach to earning, but can also mean overspending.',
    energies: [
      { expression: 'Natural luck with money and earning', polarity: 'light' },
      { expression: 'Generous to a fault', polarity: 'neutral' },
      { expression: 'Values expansion, education, and meaning', polarity: 'light' },
      { expression: 'Tendency to overspend or over-indulge', polarity: 'shadow' },
      { expression: 'Earns through teaching, travel, or publishing', polarity: 'light' },
      { expression: 'May take financial resources for granted', polarity: 'shadow' },
      { expression: 'Strong sense of self-worth', polarity: 'light' },
      { expression: 'Faith that money will always come', polarity: 'neutral' },
    ],
    tags: ['2nd-house', 'wealth', 'luck'],
  },
  {
    id: 'saturn-10th-house',
    factors: ['Saturn', '10th House'],
    title: 'The Career Builder',
    summary: 'Saturn in its natural house brings slow but steady career success. Authority is earned through discipline. May experience delays or obstacles before achieving recognition.',
    energies: [
      { expression: 'Career success through persistent effort', polarity: 'light' },
      { expression: 'Early career struggles or delays', polarity: 'shadow' },
      { expression: 'Natural authority figure', polarity: 'light' },
      { expression: 'Fear of public failure or criticism', polarity: 'shadow' },
      { expression: 'Achieves lasting reputation over time', polarity: 'light' },
      { expression: 'May feel burdened by public responsibilities', polarity: 'shadow' },
      { expression: 'Professional integrity is paramount', polarity: 'light' },
      { expression: 'Father figures or authority relationships are significant', polarity: 'neutral' },
    ],
    tags: ['10th-house', 'career', 'authority'],
  },
  {
    id: 'moon-4th-house',
    factors: ['Moon', '4th House'],
    title: 'The Emotional Foundation',
    summary: 'The Moon in its natural house emphasizes emotional security, home, and family. Strong connection to the mother and ancestral lineage.',
    energies: [
      { expression: 'Deep need for emotional security and home', polarity: 'neutral' },
      { expression: 'Strong connection to mother and family', polarity: 'light' },
      { expression: 'Moodiness tied to home environment', polarity: 'shadow' },
      { expression: 'Natural nurturer and homemaker', polarity: 'light' },
      { expression: 'Difficulty leaving the past behind', polarity: 'shadow' },
      { expression: 'Psychic connection to ancestral lineage', polarity: 'light' },
      { expression: 'Home is emotional sanctuary', polarity: 'light' },
      { expression: 'May be too dependent on family security', polarity: 'shadow' },
    ],
    tags: ['4th-house', 'home', 'mother'],
  },
  {
    id: 'venus-5th-house',
    factors: ['Venus', '5th House'],
    title: 'The Creative Lover',
    summary: 'Venus in the 5th House brings joy through romance, creativity, and pleasure. Natural artist and romantic, loves children and creative expression.',
    energies: [
      { expression: 'Joy and luck in romance', polarity: 'light' },
      { expression: 'Artistic and creative gifts', polarity: 'light' },
      { expression: 'May prioritize pleasure over responsibility', polarity: 'shadow' },
      { expression: 'Natural affection for children', polarity: 'light' },
      { expression: 'Drama or instability in love affairs', polarity: 'shadow' },
      { expression: 'Playful, flirtatious nature', polarity: 'neutral' },
      { expression: 'Luck through speculation or creative ventures', polarity: 'light' },
      { expression: 'Needs admiration and attention in love', polarity: 'neutral' },
    ],
    tags: ['5th-house', 'romance', 'creativity'],
  },
];

// ============== PLANET-PLANET ASPECTS ==============

export const planetPlanetCombinations: CombinationEntry[] = [
  // MARS-PLUTO
  {
    id: 'mars-pluto-conjunction',
    factors: ['Mars', 'Pluto', 'Conjunction'],
    title: 'The Plutonic Warrior',
    summary: 'Mars conjunct Pluto represents immense power and drive connected to survival instinct. This aspect gives tremendous willpower but also the potential for destructive expression of anger.',
    energies: [
      { expression: 'Extraordinary willpower and determination', polarity: 'light' },
      { expression: 'Potential for violence or abuse if unconscious', polarity: 'shadow' },
      { expression: 'Transformative action that destroys and rebuilds', polarity: 'light' },
      { expression: 'Rage connected to survival/power themes', polarity: 'shadow' },
      { expression: 'Sexual intensity and magnetism', polarity: 'neutral' },
      { expression: 'Power struggles in relationships', polarity: 'shadow' },
      { expression: 'Capacity to survive extreme circumstances', polarity: 'light' },
      { expression: 'Drive connected to shadow/unconscious material', polarity: 'neutral' },
      { expression: 'Can channel intense energy into healing work', polarity: 'light' },
      { expression: 'Must learn conscious relationship with power', polarity: 'neutral' },
    ],
    tags: ['intense', 'power', 'transformation', 'shadow-work'],
  },
  {
    id: 'mars-pluto-square',
    factors: ['Mars', 'Pluto', 'Square'],
    title: 'The Power Struggle',
    summary: 'Mars square Pluto creates internal and external power struggles. The drive to act meets deep resistance. Tremendous energy when integrated, destructive when unconscious.',
    energies: [
      { expression: 'Internal tension between will and compulsion', polarity: 'neutral' },
      { expression: 'Power struggles in relationships', polarity: 'shadow' },
      { expression: 'Extraordinary drive once obstacles are cleared', polarity: 'light' },
      { expression: 'Rage or violence when feeling powerless', polarity: 'shadow' },
      { expression: 'Forces transformation through crisis', polarity: 'neutral' },
      { expression: 'Manipulation or controlling behavior', polarity: 'shadow' },
      { expression: 'Capacity to overcome tremendous obstacles', polarity: 'light' },
      { expression: 'Sexual intensity with power dynamics', polarity: 'neutral' },
    ],
    tags: ['intense', 'power', 'struggle', 'transformation'],
  },
  {
    id: 'venus-jupiter-trine',
    factors: ['Venus', 'Jupiter', 'Trine'],
    title: 'The Lucky Star',
    summary: 'Venus trine Jupiter is one of the most fortunate aspects. Natural charm, social grace, and luck in love and money flow easily. The danger is complacency.',
    energies: [
      { expression: 'Natural social grace and charm', polarity: 'light' },
      { expression: 'Luck in love and financial matters', polarity: 'light' },
      { expression: 'Generous and optimistic about relationships', polarity: 'light' },
      { expression: 'May take good fortune for granted', polarity: 'shadow' },
      { expression: 'Artistic and creative abundance', polarity: 'light' },
      { expression: 'Tendency toward excess or overindulgence', polarity: 'shadow' },
      { expression: 'Attracts opportunities through positive attitude', polarity: 'light' },
      { expression: 'May lack motivation due to easy success', polarity: 'shadow' },
    ],
    tags: ['fortunate', 'luck', 'love', 'wealth'],
  },
  {
    id: 'venus-saturn-square',
    factors: ['Venus', 'Saturn', 'Square'],
    title: 'Love\'s Lessons',
    summary: 'Venus square Saturn creates tension between desire for love and fear of rejection. Relationships require work and patience. Often indicates delayed but lasting love.',
    energies: [
      { expression: 'Fear of rejection or unworthiness in love', polarity: 'shadow' },
      { expression: 'Develops genuine depth in relationships over time', polarity: 'light' },
      { expression: 'Financial caution or limitation', polarity: 'neutral' },
      { expression: 'Difficulty expressing affection openly', polarity: 'shadow' },
      { expression: 'Commits seriously once trust is established', polarity: 'light' },
      { expression: 'May attract older or authority-figure partners', polarity: 'neutral' },
      { expression: 'Self-worth tied to achievement', polarity: 'shadow' },
      { expression: 'Learns to value self through relationship work', polarity: 'light' },
    ],
    tags: ['challenging', 'love-lessons', 'delayed-gratification'],
  },
  {
    id: 'moon-pluto-conjunction',
    factors: ['Moon', 'Pluto', 'Conjunction'],
    title: 'The Emotional Depth Charge',
    summary: 'Moon conjunct Pluto creates emotional intensity that can feel overwhelming. Deep psychological insight but also potential for manipulation or being manipulated.',
    energies: [
      { expression: 'Profound emotional depth and intensity', polarity: 'light' },
      { expression: 'Potential for emotional manipulation', polarity: 'shadow' },
      { expression: 'Psychic sensitivity and intuition', polarity: 'light' },
      { expression: 'Difficulty trusting emotional safety', polarity: 'shadow' },
      { expression: 'Transformative emotional experiences', polarity: 'neutral' },
      { expression: 'Mother relationship has power dynamics', polarity: 'shadow' },
      { expression: 'Capacity for emotional healing work', polarity: 'light' },
      { expression: 'Emotional reactions can be extreme', polarity: 'shadow' },
    ],
    tags: ['intense', 'emotional', 'transformation'],
  },
  {
    id: 'sun-mc-conjunction',
    factors: ['Sun', 'Midheaven', 'Conjunction'],
    title: 'The Public Identity',
    summary: 'Sun conjunct the Midheaven places identity and ego at the peak of the chart. Career and public reputation are central to life purpose. Often indicates prominence.',
    energies: [
      { expression: 'Identity expressed through career and public role', polarity: 'neutral' },
      { expression: 'Natural authority and leadership visibility', polarity: 'light' },
      { expression: 'Ego invested in public success', polarity: 'shadow' },
      { expression: 'Career aligned with core identity', polarity: 'light' },
      { expression: 'Sensitive to public criticism', polarity: 'shadow' },
      { expression: 'Father figures influence career path', polarity: 'neutral' },
      { expression: 'Achieves recognition for authentic self', polarity: 'light' },
      { expression: 'May sacrifice private life for public role', polarity: 'shadow' },
    ],
    tags: ['career', 'prominence', 'identity'],
  },
  {
    id: 'mars-jupiter-conjunction',
    factors: ['Mars', 'Jupiter', 'Conjunction'],
    title: 'The Millionaire Aspect',
    summary: 'Mars conjunct Jupiter combines action with expansion and luck. Often associated with wealth, success in business, and winning in competitive fields. The "Millionaire Combination."',
    energies: [
      { expression: 'Luck through bold action and initiative', polarity: 'light' },
      { expression: 'Business acumen and entrepreneurial success', polarity: 'light' },
      { expression: 'Over-confidence can lead to overextension', polarity: 'shadow' },
      { expression: 'Physical energy and athletic ability', polarity: 'light' },
      { expression: 'Risk-taking that sometimes pays off big', polarity: 'neutral' },
      { expression: 'Generous but can be excessive', polarity: 'neutral' },
      { expression: 'Success in competitive fields', polarity: 'light' },
      { expression: 'May lack moderation or patience', polarity: 'shadow' },
    ],
    tags: ['wealth', 'luck', 'success', 'millionaire'],
  },
  {
    id: 'chiron-moon-square',
    factors: ['Chiron', 'Moon', 'Square'],
    title: 'The Emotional Wound',
    summary: 'Chiron square Moon indicates a deep wound around emotional safety, nurturing, and the mother. Can create difficulties in self-care but also the capacity to heal others\' emotional wounds.',
    energies: [
      { expression: 'Wound around emotional safety and nurturing', polarity: 'shadow' },
      { expression: 'Becomes skilled at nurturing others\' wounds', polarity: 'light' },
      { expression: 'Difficulty receiving emotional care', polarity: 'shadow' },
      { expression: 'Deep empathy born from personal suffering', polarity: 'light' },
      { expression: 'Mother wound or maternal absence/dysfunction', polarity: 'shadow' },
      { expression: 'Heals through exploring emotional patterns', polarity: 'light' },
      { expression: 'Emotional reactions trigger old wounds', polarity: 'shadow' },
      { expression: 'Eventually teaches emotional resilience', polarity: 'light' },
    ],
    tags: ['wound', 'healing', 'emotional', 'mother'],
  },
];

// ============== SPECIAL DEGREE PLACEMENTS ==============

export const specialDegreeCombinations: CombinationEntry[] = [
  {
    id: 'jupiter-29-cancer',
    factors: ['Jupiter', '29° Cancer'],
    title: 'The Millionaire\'s Degree',
    summary: 'Jupiter at 29° Cancer is considered one of the most auspicious degree placements for wealth. Jupiter is exalted in Cancer, and the 29th degree represents mastery of that sign\'s themes.',
    energies: [
      { expression: 'Exceptional luck with real estate and property', polarity: 'light' },
      { expression: 'Wealth through family or inheritance', polarity: 'light' },
      { expression: 'Mastery of nurturing and emotional intelligence', polarity: 'light' },
      { expression: 'May be complacent about emotional gifts', polarity: 'shadow' },
      { expression: 'Abundant home and family blessings', polarity: 'light' },
      { expression: 'Critical degree - pressure to use gifts wisely', polarity: 'neutral' },
      { expression: 'Natural generosity with resources', polarity: 'light' },
      { expression: 'Inherited wisdom about security and care', polarity: 'light' },
    ],
    sources: ['Astrological tradition', 'Critical degrees research'],
    tags: ['critical-degree', 'wealth', 'exalted', 'millionaire'],
  },
  {
    id: 'sun-29-leo',
    factors: ['Sun', '29° Leo'],
    title: 'The Fame Degree',
    summary: 'Sun at 29° Leo is a critical degree of maximum solar expression. Often found in charts of famous people, entertainers, and leaders. The pressure to shine is immense.',
    energies: [
      { expression: 'Powerful creative self-expression', polarity: 'light' },
      { expression: 'Drive for recognition and fame', polarity: 'neutral' },
      { expression: 'Dramatic life circumstances', polarity: 'neutral' },
      { expression: 'Ego may be overdeveloped or wounded', polarity: 'shadow' },
      { expression: 'Leadership capacity at maximum', polarity: 'light' },
      { expression: 'Pressure to perform or be "special"', polarity: 'shadow' },
      { expression: 'Creative mastery of self-expression', polarity: 'light' },
      { expression: 'Identity crisis at critical life moments', polarity: 'shadow' },
    ],
    tags: ['critical-degree', 'fame', 'domicile', 'leo'],
  },
];

// ============== MULTI-FACTOR COMBINATIONS ==============

export const multiFactorCombinations: CombinationEntry[] = [
  {
    id: 'mars-pluto-8th-house',
    factors: ['Mars', 'Pluto', '8th House'],
    title: 'The Extreme Power Dynamic',
    summary: 'Mars and Pluto both in the 8th House creates an extraordinarily intense combination around power, sex, death, and shared resources. This can manifest as tremendous capacity for transformation or as potential for violence and abuse in intimate relationships.',
    energies: [
      { expression: 'Exceptional power and intensity in intimate bonds', polarity: 'neutral' },
      { expression: 'Potential for control dynamics or violence in relationships', polarity: 'shadow' },
      { expression: 'Transformative capacity that survives crisis', polarity: 'light' },
      { expression: 'Obsession with power or sexuality', polarity: 'shadow' },
      { expression: 'Investigative or healing abilities at deep level', polarity: 'light' },
      { expression: 'Trust issues around shared resources', polarity: 'shadow' },
      { expression: 'Regenerative capacity after total destruction', polarity: 'light' },
      { expression: 'Must develop conscious relationship with power', polarity: 'neutral' },
      { expression: 'Can become powerful therapist or healer', polarity: 'light' },
      { expression: 'Inheritance or wealth through transformation', polarity: 'neutral' },
    ],
    sources: ['Mars-Pluto research', 'Psychological astrology'],
    tags: ['intense', 'power', 'shadow', 'transformation', 'warning'],
  },
  {
    id: 'mercury-taurus-5th-house',
    factors: ['Mercury', 'Taurus', '5th House'],
    title: 'The Creative Craftsman',
    summary: 'Mercury in Taurus in the 5th House combines slow, deliberate thinking with creative expression. Natural talent for crafts, arts, or teaching children. Communication style is playful but grounded.',
    energies: [
      { expression: 'Thoughtful, patient creative expression', polarity: 'light' },
      { expression: 'Natural talent for working with hands', polarity: 'light' },
      { expression: 'May be slow to share creative ideas', polarity: 'neutral' },
      { expression: 'Teaches children with patience and practicality', polarity: 'light' },
      { expression: 'Stubborn about creative vision', polarity: 'shadow' },
      { expression: 'Playful communication with loved ones', polarity: 'light' },
      { expression: 'Money through creative or entertainment ventures', polarity: 'light' },
      { expression: 'Pleasure in learning and mental games', polarity: 'light' },
    ],
    tags: ['creative', 'practical', 'teaching', 'crafts'],
  },
  {
    id: 'venus-jupiter-2nd-house',
    factors: ['Venus', 'Jupiter', '2nd House'],
    title: 'The Wealth Magnet',
    summary: 'Venus and Jupiter together in the 2nd House is one of the strongest indicators for financial abundance. Natural attraction of money and resources, though can also indicate overspending.',
    energies: [
      { expression: 'Strong natural wealth attraction', polarity: 'light' },
      { expression: 'Generous with resources', polarity: 'neutral' },
      { expression: 'Earns through beauty, art, or diplomacy', polarity: 'light' },
      { expression: 'Tendency to overspend or live beyond means', polarity: 'shadow' },
      { expression: 'Strong sense of personal value', polarity: 'light' },
      { expression: 'May take financial luck for granted', polarity: 'shadow' },
      { expression: 'Lucky in speculation and investments', polarity: 'light' },
      { expression: 'Values expansion, learning, and beauty', polarity: 'light' },
    ],
    tags: ['wealth', 'lucky', 'abundance'],
  },
  {
    id: 'saturn-moon-4th-house',
    factors: ['Saturn', 'Moon', '4th House'],
    title: 'The Heavy Foundation',
    summary: 'Saturn and Moon together in the 4th House indicates early emotional restriction or family burdens. The home was a place of duty rather than nurturing. Develops emotional wisdom through difficulty.',
    energies: [
      { expression: 'Early family responsibilities or hardship', polarity: 'shadow' },
      { expression: 'Develops strong emotional structure over time', polarity: 'light' },
      { expression: 'Mother relationship carries duty or coldness', polarity: 'shadow' },
      { expression: 'Creates secure home through discipline', polarity: 'light' },
      { expression: 'Depression or melancholy tied to family', polarity: 'shadow' },
      { expression: 'Late-life emotional security and wisdom', polarity: 'light' },
      { expression: 'Home becomes professional or structured', polarity: 'neutral' },
      { expression: 'Ancestral patterns of emotional restriction', polarity: 'shadow' },
    ],
    tags: ['family', 'emotional-restriction', 'late-bloomer'],
  },
];

// ============== MASTER COMBINATION FINDER ==============

export const getAllCombinations = (): CombinationEntry[] => {
  return [
    ...planetSignCombinations,
    ...planetHouseCombinations,
    ...planetPlanetCombinations,
    ...specialDegreeCombinations,
    ...multiFactorCombinations,
  ];
};

/**
 * Find combinations that match ANY of the given factors
 */
export const findCombinations = (factors: string[]): CombinationEntry[] => {
  const allCombos = getAllCombinations();
  const normalizedFactors = factors.map(f => f.toLowerCase().trim());
  
  return allCombos.filter(combo => {
    const comboFactors = combo.factors.map(f => f.toLowerCase());
    // Check if ALL user-selected factors are present in this combination
    return normalizedFactors.every(factor => 
      comboFactors.some(cf => cf.includes(factor) || factor.includes(cf))
    );
  });
};

/**
 * Find exact match for a specific combination
 */
export const findExactCombination = (factors: string[]): CombinationEntry | undefined => {
  const allCombos = getAllCombinations();
  const normalizedFactors = factors.map(f => f.toLowerCase().trim()).sort();
  
  return allCombos.find(combo => {
    const comboFactors = combo.factors.map(f => f.toLowerCase()).sort();
    return JSON.stringify(comboFactors) === JSON.stringify(normalizedFactors);
  });
};

// ============== CONSTANTS ==============

export const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'
];

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const HOUSES = [
  '1st House', '2nd House', '3rd House', '4th House', '5th House', '6th House',
  '7th House', '8th House', '9th House', '10th House', '11th House', '12th House'
];

export const ASPECTS = [
  'Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'
];

export const POINTS = [
  'Ascendant', 'Midheaven', 'North Node', 'South Node'
];
