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
    core: 'Two planets in the same spot become one thing for you. You cannot feel one without the other turning on too. The flavor depends on which two: Venus + Jupiter feels lucky and generous; Mars + Saturn feels like driving with the brakes on.',
    waxingVsWaning: 'A conjunction is the start of a new cycle for those two planets, like a New Moon. Whatever begins now (project, relationship, habit, decision) is the seed of something that plays out over the next chapter.',
    personalVsOuter: 'When the planets are personal (Sun, Moon, Mercury, Venus, Mars), you feel it in your daily life. When they are outer (Jupiter–Saturn, Saturn–Pluto, etc.), the whole generation feels it as the mood of the era.',
    gift: 'Concentrated power. When you put your attention on this area, things actually move.',
    challenge: 'No distance. You cannot step back and analyze, and other people will feel the intensity even when you think you are hiding it.',
    teaching: 'Two forces fused in one spot are stronger than either alone, but only if you stay aware that both are in the room.',
  },
  {
    name: 'Sextile', symbol: '⚹', degrees: 60, orb: 6,
    type: 'Major', nature: 'Harmonious',
    keywords: ['Opportunity', 'Talent', 'Easy flow', 'Cooperation'],
    core: 'A small, easy-to-miss opening. A useful intro, a small idea, a quick conversation. Quiet, not dramatic. It only pays off if you reach out, ask, or follow up.',
    waxingVsWaning: 'A waxing sextile (60° ahead) is a skill you are still building. A waning sextile (300°) is a skill you already have and can teach or use to help someone else.',
    personalVsOuter: 'Personal-planet sextiles show up as everyday small wins (a useful conversation, a small intro). Outer-planet sextiles are slow generational opportunities.',
    gift: 'Low-stakes ways to take a real step forward in this area.',
    challenge: 'Looks too small to bother with, so you skip it and the window closes.',
    teaching: 'Talent you never use is just potential. Sextiles give you the door, you have to walk through it.',
  },
  {
    name: 'Square', symbol: '□', degrees: 90, orb: 8,
    type: 'Major', nature: 'Dynamic',
    keywords: ['Tension', 'Action', 'Crisis', 'Achievement', 'Friction'],
    core: 'Pressure that will not let up. Two planets at 90° want different things at the same time, and you cannot have both. You will feel cornered, irritable, or like the same fight keeps coming back, until you actually change something instead of just patching it.',
    waxingVsWaning: 'A waxing square (first quarter) shouts "do something now." It punches forward. A waning square (third quarter) sits with the wreckage and asks "why did I keep doing it that way?" It is more reflective, less reactive.',
    personalVsOuter: 'Personal squares are daily friction (the same argument with your partner, the same money problem). Outer-planet squares are eras of crisis (Uranus square Pluto = revolution and protest).',
    gift: 'Real growth. You build a muscle here you would not have built if life had stayed comfortable.',
    challenge: 'You will pick fights, blame people, freeze, or burn out. The discomfort is the engine, but it can also break you if you ignore it.',
    teaching: 'Growth needs friction. The square is not punishing you; it is the only thing that gets you to actually change.',
  },
  {
    name: 'Trine', symbol: '△', degrees: 120, orb: 8,
    type: 'Major', nature: 'Harmonious',
    keywords: ['Flow', 'Ease', 'Natural talent', 'Grace', 'Luck'],
    core: 'Things click here without effort. Doors open, the right person calls, the project flows. Trines are easy in the same way being good at something since childhood is easy: you barely notice it, so you may not value it.',
    waxingVsWaning: 'A waxing trine is a talent you are still learning to use. A waning trine is a talent you have mastered and can pass on to someone else.',
    personalVsOuter: 'Personal trines are everyday gifts (people like you, money comes easily, you read the room well). Outer-planet trines are cultural windows when art, science, or peace flow more easily.',
    gift: 'Low resistance. Things that exhaust other people come naturally to you here.',
    challenge: 'Coasting. Because nothing forces you, you may never actually develop the gift.',
    teaching: 'A gift you never use is wasted. The trine gives you the ease; what you do with it is on you.',
  },
  {
    name: 'Quincunx', symbol: '⚻', degrees: 150, orb: 3,
    type: 'Major', nature: 'Complex',
    keywords: ['Adjustment', 'Irritation', 'Health', 'Incompatibility', 'Adaptation'],
    core: 'Something is off and you cannot name it. A low-grade itch, a body symptom, a timing issue, a relationship that almost works but never quite does. Two parts of your life will not cooperate no matter how you arrange them.',
    waxingVsWaning: 'Both forms ask for constant small adjustments. A waxing quincunx (150° ahead) usually shows up in the body or daily routines. A waning quincunx (210°) usually shows up as a psychological pattern you keep tweaking.',
    personalVsOuter: 'Personal quincunxes show up as health stuff or behavioral tics. Outer-planet quincunxes are blind spots a whole generation has to keep working around.',
    gift: 'You learn to adapt on the fly and stop forcing things that do not fit.',
    challenge: 'Chronic low-grade stress, weird health flare-ups, the sense that you are doing everything right and it still does not click.',
    teaching: 'Some things never resolve, they just get managed better. The quincunx teaches you to tweak instead of fight.',
  },
  {
    name: 'Opposition', symbol: '☍', degrees: 180, orb: 8,
    type: 'Major', nature: 'Dynamic',
    keywords: ['Awareness', 'Polarization', 'Projection', 'Balance', 'Relationships'],
    core: 'You will keep meeting one specific person who is acting out exactly the part of you you have not owned. The fight or attraction with them is really about you. Oppositions show up most in relationships: spouses, business partners, rivals.',
    waxingVsWaning: 'There is only one opposition point in any cycle (180°). It is the climax, the Full Moon moment of any pair, where things peak and you can finally see what is going on.',
    personalVsOuter: 'Personal oppositions are about your relationships. Outer-planet oppositions create generational standoffs (left vs right, old vs new, freedom vs control).',
    gift: 'You can finally see yourself from the outside, through the person who is mirroring you.',
    challenge: 'Blaming the other person, swinging from one extreme to the other, or feeling stuck in the middle of two real needs.',
    teaching: 'The person across from you is not your enemy. They are showing you what you have been refusing to own.',
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
