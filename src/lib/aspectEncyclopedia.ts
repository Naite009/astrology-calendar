// Aspect Encyclopedia — comprehensive data for all major aspects + patterns

export interface AspectData {
  name: string;
  symbol: string;
  degrees: number;
  orb: number;
  type: 'Major' | 'Minor';
  nature: 'Harmonious' | 'Dynamic' | 'Complex' | 'Neutral';
  keywords: string[];
  core: string;
  waxingVsWaning: string;
  personalVsOuter: string;
  gift: string;
  challenge: string;
  teaching: string;
}

export interface PatternData {
  name: string;
  symbol: string;
  description: string;
  components: string;
  meaning: string;
  gift: string;
  challenge: string;
  teaching: string;
}

export const ASPECTS_DATA: AspectData[] = [
  {
    name: 'Conjunction', symbol: '☌', degrees: 0, orb: 8,
    type: 'Major', nature: 'Neutral',
    keywords: ['Fusion', 'Intensification', 'Unity', 'New beginnings'],
    core: 'Two planets merge into a single energetic stream. They cannot be separated — for better or worse, these energies are fused. A conjunction is like two people sharing one body: they amplify each other but also lose individual distinction. The nature of a conjunction depends entirely on WHICH planets are involved — Venus conjunct Jupiter is heaven; Mars conjunct Saturn is a constant internal brake.',
    waxingVsWaning: 'Conjunctions begin a new cycle. In synastry or progressions, a conjunction is a seed moment — something is being born. There is no waxing/waning distinction for conjunctions since they ARE the starting point.',
    personalVsOuter: 'Personal planet conjunctions (Sun, Moon, Mercury, Venus, Mars) are felt viscerally and daily. Outer planet conjunctions (Jupiter-Saturn, Saturn-Pluto, etc.) are generational and historical — they define eras.',
    gift: 'Concentrated power, focused expression, singular purpose',
    challenge: 'Over-identification with one energy, blind spots, intensity that overwhelms',
    teaching: 'When two forces merge, the result is greater than either alone — but only if you remain conscious of both.',
  },
  {
    name: 'Sextile', symbol: '⚹', degrees: 60, orb: 6,
    type: 'Major', nature: 'Harmonious',
    keywords: ['Opportunity', 'Talent', 'Easy flow', 'Cooperation'],
    core: 'The sextile is a gentle open door — opportunity that requires you to walk through it. Unlike the trine (which flows automatically), the sextile offers potential that must be activated through conscious effort. Signs in sextile share compatible elements (Fire-Air, Earth-Water) and communicate easily.',
    waxingVsWaning: 'A waxing sextile (60° ahead) is an emerging opportunity — new skills forming, fresh connections developing. A waning sextile (300° or 60° behind) is a mature gift — skills you\'ve already developed and can now share with others. The waning sextile teaches; the waxing sextile learns.',
    personalVsOuter: 'Personal sextiles create everyday talents and social ease. Outer planet sextiles create generational opportunities for collective progress.',
    gift: 'Natural talent that grows with effort, social ease, mental agility',
    challenge: 'Can be overlooked because it\'s subtle, requires activation, may never develop without effort',
    teaching: 'Talent without effort is wasted potential. The sextile gives you the raw material — you must build with it.',
  },
  {
    name: 'Square', symbol: '□', degrees: 90, orb: 8,
    type: 'Major', nature: 'Dynamic',
    keywords: ['Tension', 'Action', 'Crisis', 'Achievement', 'Friction'],
    core: 'The square creates FRICTION — internal tension that demands action. Two planets at 90° are working at cross-purposes, like an engine with the brakes on. This creates enormous frustration but also enormous drive. Squares are the aspect of achievement: every successful person has them. Without squares, there is no motivation to overcome.',
    waxingVsWaning: 'The WAXING square (90° ahead, first quarter) is a crisis of ACTION — "I must do something NOW." It pushes forward through obstacles with raw force. The WANING square (270° or 90° behind, third quarter) is a crisis of CONSCIOUSNESS — "I must understand what this means." It demands inner reflection and course correction. They feel very different: waxing squares punch through walls; waning squares sit with the rubble and ask why.',
    personalVsOuter: 'Personal squares create daily frustration and drive. Outer planet squares create generational crises and collective turning points (e.g., Uranus square Pluto = revolution).',
    gift: 'Drive, determination, resilience, the ability to achieve through struggle',
    challenge: 'Chronic tension, stress, tendency to create conflict, feeling perpetually unsatisfied',
    teaching: 'Growth requires friction. The square is your personal trainer — painful in the moment, transformative over time.',
  },
  {
    name: 'Trine', symbol: '△', degrees: 120, orb: 8,
    type: 'Major', nature: 'Harmonious',
    keywords: ['Flow', 'Ease', 'Natural talent', 'Grace', 'Luck'],
    core: 'The trine is pure FLOW — two planets working together so naturally that you barely notice them. Signs in trine share the same element (Fire-Fire, Earth-Earth, etc.) and understand each other instinctively. Trines are gifts you were born with: natural talents, easy areas of life, places where things just work.',
    waxingVsWaning: 'A waxing trine (120° ahead) is a talent being developed — creative potential expanding into form. A waning trine (240° or 120° behind) is a talent you\'ve mastered — wisdom flowing from experience. The waning trine has a teaching quality; the waxing trine has an exploring quality.',
    personalVsOuter: 'Personal trines create easy daily gifts. Outer planet trines create generational ease — periods of cultural flowering and harmony.',
    gift: 'Natural ability, ease, grace, things that work without effort',
    challenge: 'Complacency, taking gifts for granted, laziness in areas of natural talent, no motivation to develop',
    teaching: 'Gifts that are never developed become wasted potential. The trine gives you ease — discipline makes it mastery.',
  },
  {
    name: 'Quincunx', symbol: '⚻', degrees: 150, orb: 3,
    type: 'Major', nature: 'Complex',
    keywords: ['Adjustment', 'Irritation', 'Health', 'Incompatibility', 'Adaptation'],
    core: 'The quincunx connects two signs that share NOTHING — different element, different modality, different polarity. They simply don\'t understand each other. This creates a constant low-level irritation, like wearing shoes that almost fit. The quincunx demands perpetual adjustment with no resolution — you never "solve" it, you just keep adapting.',
    waxingVsWaning: 'Both forms share the quality of necessary adjustment, but a waxing quincunx (150° ahead) creates health and behavioral adjustments you must learn, while a waning quincunx (210° or 150° behind) creates psychological and spiritual adjustments from past patterns.',
    personalVsOuter: 'Personal quincunxes often manifest as health issues or behavioral tics. Outer planet quincunxes create generational "blind spots" that require collective adjustment.',
    gift: 'Adaptability, the ability to bridge incompatible energies, health awareness',
    challenge: 'Chronic low-level stress, health vulnerabilities, feeling "off," inability to fully resolve tension',
    teaching: 'Not everything can be fixed. Some things must simply be managed with awareness and grace. The quincunx teaches acceptance through adaptation.',
  },
  {
    name: 'Opposition', symbol: '☍', degrees: 180, orb: 8,
    type: 'Major', nature: 'Dynamic',
    keywords: ['Awareness', 'Polarization', 'Projection', 'Balance', 'Relationships'],
    core: 'The opposition is a MIRROR — two planets facing each other across the zodiac, pulling in opposite directions. Signs in opposition are complementary: Aries/Libra, Taurus/Scorpio, etc. You need BOTH, but you tend to identify with one and project the other onto partners, enemies, or circumstances. Oppositions are the aspect of awareness: they force you to see what you\'re not.',
    waxingVsWaning: 'There is only one opposition point in any cycle (180°), so waxing/waning doesn\'t apply in the same way. However, the opposition IS the turning point of any cycle — the Full Moon moment, the climax, the point of maximum awareness and tension.',
    personalVsOuter: 'Personal oppositions play out in relationships — you literally attract the other end. Outer planet oppositions create collective polarization and require societal integration.',
    gift: 'Objectivity, ability to see both sides, diplomatic skills, relationship awareness',
    challenge: 'Projection, polarization, feeling torn between extremes, relationship dependency',
    teaching: 'Your opposite is not your enemy — it is your missing half. Integration, not elimination, is the path.',
  },
];

export const STELLIUM_INFO = {
  title: 'Stelliums',
  description: 'A stellium is a cluster of 3+ planets in the same sign or house. It creates an overwhelming concentration of energy in one area of life.',
  keyPoints: [
    'Personal planet stelliums (Sun, Moon, Mercury, Venus, Mars) are felt more intensely than outer planet stelliums.',
    'A stellium in a SIGN gives that sign outsized influence on your personality and behavior.',
    'A stellium in a HOUSE makes that life area the dominant focus — for better or worse.',
    'Having 4+ planets in one sign/house means other areas of life may feel neglected.',
    'The tightest conjunction within the stellium is the core of the cluster.',
    'Outer planet stelliums (e.g., Uranus-Neptune-Saturn in Capricorn in 1989-91) are generational — shared by millions.',
  ],
};

export const PATTERNS_DATA: PatternData[] = [
  {
    name: 'Grand Trine', symbol: '△',
    description: 'Three planets all in trine to each other (120° apart), forming an equilateral triangle in one element.',
    components: '3 trines connecting 3 planets',
    meaning: 'A closed circuit of flowing harmony in one element. Natural talent that circulates effortlessly. Fire Grand Trines give creative inspiration; Earth gives material stability; Air gives intellectual brilliance; Water gives emotional depth.',
    gift: 'Innate talent, ease, protection, a reservoir of natural ability',
    challenge: 'Complacency — the ease can prevent growth. You may never develop these gifts because they come too easily.',
    teaching: 'Without conscious effort, even the greatest natural talent remains latent potential. A Grand Trine is a gift — discipline is what unwraps it.',
  },
  {
    name: 'T-Square', symbol: '⊤',
    description: 'Two planets in opposition, both squaring a third (apex) planet, creating a triangle of dynamic tension.',
    components: '1 opposition + 2 squares',
    meaning: 'The apex planet is the PRESSURE POINT — where all tension concentrates and where all action happens. The "empty leg" (the point opposite the apex) is the release valve — the area of life where relief can be found.',
    gift: 'Tremendous drive, achievement through tension, focused ambition',
    challenge: 'Chronic stress at the apex, burnout, creating crises to relieve internal pressure',
    teaching: 'The T-Square is the engine of achievement. Your greatest accomplishments come from your greatest tensions.',
  },
  {
    name: 'Grand Cross', symbol: '✚',
    description: 'Four planets forming a square pattern: two oppositions crossing at 90°.',
    components: '2 oppositions + 4 squares',
    meaning: 'Four corners of the chart pulling in four directions simultaneously. This is the most high-pressure configuration — constant internal tension from all sides. Cardinal Grand Crosses drive action; Fixed ones create stubborn endurance; Mutable ones create mental overwhelm.',
    gift: 'Extraordinary resilience, ability to handle pressure, dynamic energy that prevents stagnation',
    challenge: 'Chronic stress, feeling pulled apart, tendency to create crisis, difficulty finding peace',
    teaching: 'You are forged in fire. The Grand Cross doesn\'t resolve — it fuels. Learn to harness the engine, not fight it.',
  },
  {
    name: 'Yod (Finger of God)', symbol: '🝊',
    description: 'Two planets in sextile (60°), both forming quincunxes (150°) to a third planet — pointing like a finger.',
    components: '1 sextile + 2 quincunxes',
    meaning: 'The apex planet carries a sense of FATE and MISSION. You feel "pointed" somewhere you can\'t fully explain. The sextile base provides skills; the apex is where destiny concentrates. Health issues often manifest at the apex planet.',
    gift: 'Sense of purpose, spiritual clarity, ability to channel diverse skills toward a mission',
    challenge: 'Health crises at the apex, feeling "chosen" in uncomfortable ways, constant need for adjustment',
    teaching: 'The Yod is an arrow of fate. The question is not whether you\'ll follow it — but whether you\'ll do so consciously.',
  },
  {
    name: 'Mystic Rectangle', symbol: '▭',
    description: 'Four planets forming a rectangle: two oppositions bridged by sextiles and trines.',
    components: '2 oppositions + 2 trines + 2 sextiles',
    meaning: 'INTEGRATED TENSION — two opposing forces connected by harmonious aspects. You naturally resolve conflicts that paralyze others. The trines provide talent; the oppositions provide awareness; the sextiles provide opportunity.',
    gift: 'Balance between opposing forces, conflict resolution, productive tension, diplomatic genius',
    challenge: 'Can feel too balanced (stasis), may avoid necessary conflict, passive when action is needed',
    teaching: 'Your oppositions give you awareness; your trines give you talent. Your job is to activate both consciously.',
  },
  {
    name: 'Kite', symbol: '🪁',
    description: 'A Grand Trine with one planet opposing the apex, creating sextiles to the other two trine points.',
    components: '1 Grand Trine + 1 opposition + 2 sextiles',
    meaning: 'The Grand Trine provides natural talent; the opposition planet GROUNDS it into practical expression. Without the opposition, the Grand Trine is lazy. The Kite gives gifts a direction.',
    gift: 'Natural talents with a productive outlet, grounded gifts, innate abilities that actually manifest',
    challenge: 'The opposition point creates tension that must be integrated, possible over-reliance on natural talent',
    teaching: 'Talent without direction is wasted. The Kite gives your gifts a point — and a purpose.',
  },
];

export const CHART_SHAPES_DATA = [
  { name: 'Bowl', description: 'All planets in 180° — focused, purposeful, aware of what\'s missing' },
  { name: 'Bucket', description: 'Bowl + one handle planet on the other side — all energy funnels through the handle' },
  { name: 'Bundle', description: 'All planets within 120° — extreme specialization, laser focus' },
  { name: 'Locomotive', description: 'Planets span 240° with 120° empty — driven, always chasing the gap' },
  { name: 'Seesaw', description: 'Two groups opposite each other — sees all sides, oscillates between polarities' },
  { name: 'Splash', description: 'Planets scattered evenly — Renaissance soul, versatile but scattered' },
  { name: 'Splay', description: 'Irregular clusters with gaps — individual, strong-willed, refuses categories' },
];
