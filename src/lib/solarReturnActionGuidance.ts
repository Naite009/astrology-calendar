/**
 * Action Guidance Layer
 * 
 * Generates "Lean into / Avoid / Best use" decision framework
 * for major SR placements (planets in houses, key aspects).
 */

export interface ActionGuidance {
  placement: string;        // e.g. "Mars in SR 10th House"
  planetSymbol: string;
  leanInto: string;
  avoid: string;
  bestUse: string;
  timing?: string;          // optional timing note
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

interface HouseGuidance {
  leanInto: string;
  avoid: string;
  bestUse: string;
}

const PLANET_HOUSE_GUIDANCE: Record<string, Record<number, HouseGuidance>> = {
  Sun: {
    1: { leanInto: 'Reinventing your image, taking bold personal initiatives, physical transformation', avoid: 'Ego-driven decisions that ignore others\' needs', bestUse: 'Launch something that represents the real you — a project, look, or direction that feels authentically yours' },
    2: { leanInto: 'Building financial stability, clarifying your values, investing in yourself', avoid: 'Overspending to prove your worth or hoarding out of fear', bestUse: 'Create a concrete plan for financial growth — budget, invest, or monetize a skill' },
    3: { leanInto: 'Writing, teaching, learning new skills, strengthening sibling bonds', avoid: 'Gossip, scattered attention, saying yes to every conversation', bestUse: 'Start the course, write the article, have the conversation you\'ve been avoiding' },
    4: { leanInto: 'Home improvements, family healing, creating emotional safety', avoid: 'Isolating yourself or avoiding family issues that need addressing', bestUse: 'Make your living space a true sanctuary — renovate, reorganize, or have honest family conversations' },
    5: { leanInto: 'Creative projects, romantic risks, playfulness, time with children', avoid: 'Drama for drama\'s sake, gambling (financial or emotional), ego-driven romance', bestUse: 'Create something from the heart — art, music, writing, or a genuine romantic connection' },
    6: { leanInto: 'Health overhauls, new work systems, daily routine optimization', avoid: 'Perfectionism that paralyzes action, overworking to prove yourself', bestUse: 'Build one sustainable health habit and one work system that saves you time daily' },
    7: { leanInto: 'Deepening partnerships, collaborative projects, honest relationship conversations', avoid: 'People-pleasing, losing yourself in another person, avoiding necessary conflict', bestUse: 'Have the relationship conversation you\'ve been postponing — clarity serves both of you' },
    8: { leanInto: 'Financial restructuring, therapeutic work, emotional honesty with intimates', avoid: 'Power plays, manipulation, or avoiding debt/tax issues', bestUse: 'Face the financial or psychological truth you\'ve been skirting — freedom is on the other side' },
    9: { leanInto: 'Travel, higher education, publishing, philosophical exploration', avoid: 'Preaching without practicing, overcommitting to grand plans without follow-through', bestUse: 'Book the trip, start the degree, or publish the work — expansion requires action' },
    10: { leanInto: 'Career advancement, public visibility, taking on leadership roles', avoid: 'Stepping on others to climb, neglecting personal life for status', bestUse: 'Accept the promotion, launch publicly, or define what legacy you\'re actually building' },
    11: { leanInto: 'Community involvement, networking with purpose, collective projects', avoid: 'Conforming to fit in, spreading yourself across too many groups', bestUse: 'Find your people — join or create one group aligned with your actual values' },
    12: { leanInto: 'Meditation, therapy, solitude, creative/spiritual practices', avoid: 'Self-sabotage through escapism, isolation disguised as "spiritual work"', bestUse: 'Schedule regular solitude for reflection — journal, meditate, or create without an audience' },
  },
  Mars: {
    1: { leanInto: 'Physical fitness, asserting boundaries, competitive pursuits', avoid: 'Aggression, recklessness, picking fights to prove yourself', bestUse: 'Channel the surge into exercise, a sport, or a bold professional move in the first 3 months' },
    2: { leanInto: 'Aggressive saving, fighting for a raise, defending your values', avoid: 'Impulsive purchases, financial arguments, spending to cope with anger', bestUse: 'Negotiate your salary or rates — Mars here gives you the courage to ask for what you\'re worth' },
    3: { leanInto: 'Direct communication, standing your ground in debates, active learning', avoid: 'Verbal aggression, road rage, arguments with siblings or neighbors', bestUse: 'Use your sharper tongue for advocacy or debate — speak with precision, not just volume' },
    4: { leanInto: 'Home renovation, protecting family, setting domestic boundaries', avoid: 'Explosive arguments at home, passive-aggressive family dynamics', bestUse: 'Channel the energy into physically improving your space — paint, build, reorganize' },
    5: { leanInto: 'Competitive sports, passionate creative projects, bold romantic pursuit', avoid: 'Drama in love affairs, competitive parenting, creative ego battles', bestUse: 'Throw yourself into a creative project with physical energy — perform, compete, or build something' },
    6: { leanInto: 'Intense workout routines, surgical precision at work, health discipline', avoid: 'Overtraining, workplace conflicts, pushing through illness', bestUse: 'Start an exercise program that matches your intensity — martial arts, HIIT, or competitive training' },
    7: { leanInto: 'Fighting for your relationship, assertive partnership dynamics', avoid: 'Picking fights with partners, attracting conflict through unresolved anger', bestUse: 'Address relationship friction directly — honest confrontation heals more than avoidance' },
    8: { leanInto: 'Pursuing financial claims, deep psychological work, sexual honesty', avoid: 'Power struggles, vengefulness, using intimacy as a weapon', bestUse: 'Face the fear — the therapy session, the financial negotiation, the emotional excavation' },
    9: { leanInto: 'Adventurous travel, defending beliefs, fighting for justice', avoid: 'Religious or ideological aggression, reckless travel, legal battles from ego', bestUse: 'Plan a trip that challenges you physically — hiking, adventure travel, or a demanding pilgrimage' },
    10: { leanInto: 'Asserting leadership, ambitious career moves, competitive edge at work', avoid: 'Picking fights with authority figures, burning bridges professionally', bestUse: 'Use the first 3 months to assert leadership strategically — make your move before the energy peaks' },
    11: { leanInto: 'Activism, fighting for a cause, energizing group projects', avoid: 'Dominating friend groups, social media battles, causes driven by anger not values', bestUse: 'Lead a group project or activist effort — Mars here wants to fight FOR something' },
    12: { leanInto: 'Solo physical practice, shadow work, channeling anger constructively', avoid: 'Suppressed rage, self-sabotage, hidden enemies (including yourself)', bestUse: 'Find a physical outlet for anger that doesn\'t involve other people — boxing, running, solo martial arts' },
  },
  Saturn: {
    1: { leanInto: 'Building authentic self-authority, health discipline, mature self-presentation', avoid: 'Self-criticism, excessive seriousness, refusing help', bestUse: 'Commit to one long-term self-improvement project — the results compound over the entire year' },
    2: { leanInto: 'Financial discipline, long-term investing, defining core values', avoid: 'Scarcity mindset, hoarding, punishing yourself financially', bestUse: 'Build a 12-month financial plan — Saturn rewards structure, not impulse' },
    3: { leanInto: 'Serious study, disciplined writing, meaningful conversations', avoid: 'Communication paralysis, excessive self-editing, avoiding difficult conversations', bestUse: 'Commit to a learning program or writing project that requires sustained effort' },
    4: { leanInto: 'Home renovation, family responsibility, emotional foundation work', avoid: 'Emotional coldness at home, avoiding family obligations, rigidity in domestic life', bestUse: 'Address the family or home issue you\'ve been postponing — Saturn makes it unavoidable' },
    5: { leanInto: 'Disciplined creativity, serious romance, responsible parenting', avoid: 'Killing joy with over-seriousness, refusing to play, creative perfectionism', bestUse: 'Create something that requires discipline — write the book, practice the instrument, commit to the relationship' },
    6: { leanInto: 'Sustainable health routines, work mastery, efficient systems', avoid: 'Workaholism, health neglect until crisis, excessive self-punishment', bestUse: 'Build the routine your future self will thank you for — diet, exercise, sleep, work systems' },
    7: { leanInto: 'Relationship commitment, clear partnership agreements, honest assessments', avoid: 'Staying in dead relationships from duty, emotional withholding', bestUse: 'Decide: commit fully or release honestly — Saturn doesn\'t do halfway' },
    8: { leanInto: 'Financial restructuring, therapeutic commitment, facing psychological truths', avoid: 'Avoiding debt, refusing to examine power dynamics, emotional lockdown', bestUse: 'Hire the financial advisor, start therapy, or have the conversation about shared resources' },
    9: { leanInto: 'Formal education, structured travel, deepening philosophical commitments', avoid: 'Rigid beliefs, fear of the unknown, canceling trips from anxiety', bestUse: 'Enroll in the program or plan the trip that requires commitment — Saturn rewards follow-through' },
    10: { leanInto: 'Career building, accepting authority, professional mastery', avoid: 'Overwork, neglecting personal life for ambition, fear of visibility', bestUse: 'Take on the responsibility — the promotion, the project, the leadership role. Saturn here means you\'re ready even if you don\'t feel it' },
    11: { leanInto: 'Quality friendships, meaningful group commitments, long-term social goals', avoid: 'Social isolation, fair-weather friendships, giving up on community', bestUse: 'Invest in 2-3 friendships that matter — depth over breadth is Saturn\'s law' },
    12: { leanInto: 'Disciplined spiritual practice, structured solitude, therapeutic commitment', avoid: 'Spiritual bypassing, avoiding inner work, martyrdom', bestUse: 'Establish a daily practice — meditation, journaling, or therapy — and don\'t skip it' },
  },
  Jupiter: {
    1: { leanInto: 'Personal growth, expanded self-image, physical wellness improvements', avoid: 'Overconfidence, weight gain from excess, taking on too many personal projects', bestUse: 'Say yes to the opportunity that scares you — Jupiter here protects bold self-expression' },
    2: { leanInto: 'Income growth, generous spending on quality, expanding your value offer', avoid: 'Financial overextension, assuming money will always flow this freely', bestUse: 'Invest in yourself — courses, tools, or experiences that increase your earning capacity' },
    3: { leanInto: 'Publishing, teaching, expanding your network, learning new skills', avoid: 'Overcommitting to conversations, spreading yourself too thin socially', bestUse: 'Start the blog, podcast, or course — Jupiter here amplifies your voice' },
    4: { leanInto: 'Home expansion, family celebrations, deepening roots', avoid: 'Over-decorating, family codependency, avoiding growth outside the home', bestUse: 'Upgrade your living situation — bigger space, better location, or deeper family connection' },
    5: { leanInto: 'Creative abundance, romantic optimism, joyful parenting', avoid: 'Gambling, excessive partying, romantic naivety', bestUse: 'Create abundantly — Jupiter in 5 is the best placement for artistic output and genuine fun' },
    6: { leanInto: 'Finding meaningful work, health improvements, better daily systems', avoid: 'Ignoring health opportunities, being too casual about work responsibilities', bestUse: 'Upgrade your daily life — better food, movement, and work that actually matters to you' },
    7: { leanInto: 'Partnership growth, business collaborations, relationship expansion', avoid: 'Rushing into partnerships, idealizing others, legal overconfidence', bestUse: 'Partner up — the right collaboration can multiply your reach this year' },
    8: { leanInto: 'Financial windfalls, deep emotional growth, transformative experiences', avoid: 'Risky financial bets, using transformation as an excuse to blow things up', bestUse: 'Investigate the financial opportunity or therapeutic approach you\'ve been curious about' },
    9: { leanInto: 'International travel, higher education, philosophical breakthroughs', avoid: 'Overcommitting to travel, spiritual tourism without depth', bestUse: 'Go somewhere that genuinely challenges your worldview — not just a vacation' },
    10: { leanInto: 'Career expansion, public recognition, professional opportunity', avoid: 'Arrogance, assuming success is permanent, overextending professionally', bestUse: 'Accept the bigger role — Jupiter here means you\'re ready for more visibility and responsibility' },
    11: { leanInto: 'Expanding your social circle, joining movements, visionary planning', avoid: 'Overcommitting to causes, confusing popularity with purpose', bestUse: 'Join the organization, attend the event, or build the community project you\'ve been imagining' },
    12: { leanInto: 'Spiritual expansion, creative retreat, meaningful solitude', avoid: 'Escapism through spirituality, avoiding reality through retreat', bestUse: 'Take the retreat, start the meditation practice, or commit to the creative project that needs silence' },
  },
};

// Venus and Moon get simpler guidance
const VENUS_GUIDANCE: Record<number, HouseGuidance> = {
  1: { leanInto: 'Personal charm, beauty upgrades, graceful self-presentation', avoid: 'Vanity, people-pleasing, basing identity on attractiveness', bestUse: 'Refresh your style in a way that reflects your inner values' },
  2: { leanInto: 'Financial pleasure, luxury purchases, artistic income', avoid: 'Overspending on beauty, confusing comfort with purpose', bestUse: 'Invest in one beautiful thing that holds value' },
  3: { leanInto: 'Charming communication, artistic writing, harmonious conversations', avoid: 'Superficial flattery, avoiding honest conversations', bestUse: 'Write the love letter, the poem, or the diplomatic message' },
  4: { leanInto: 'Beautiful home, family harmony, nostalgic pleasures', avoid: 'Codependency disguised as nurturing', bestUse: 'Create beauty in your home — it anchors your emotional life this year' },
  5: { leanInto: 'Romance, artistic creation, joyful self-expression', avoid: 'Love addiction, creative competition', bestUse: 'Fall in love — with a person, a project, or life itself' },
  6: { leanInto: 'Enjoyable work, wellness as pleasure, beautiful daily routines', avoid: 'Laziness disguised as "self-care"', bestUse: 'Make your daily routine genuinely pleasant — not just efficient' },
  7: { leanInto: 'Partnership harmony, romantic commitment, collaborative beauty', avoid: 'Sacrificing your needs for peace', bestUse: 'Deepen your most important relationship through shared pleasure' },
  8: { leanInto: 'Intimate depth, shared financial growth, emotional vulnerability', avoid: 'Using charm to manipulate, avoiding genuine intimacy', bestUse: 'Let someone truly see you — vulnerability is the access point' },
  9: { leanInto: 'Cultural travel, beauty in philosophy, romantic adventures', avoid: 'Idealizing foreign cultures, romantic escapism', bestUse: 'Travel for beauty — art, architecture, cuisine, or love abroad' },
  10: { leanInto: 'Professional charm, aesthetic career moves, public grace', avoid: 'Relying on charm over competence', bestUse: 'Use your aesthetic sense professionally — design, diplomacy, or public relations' },
  11: { leanInto: 'Social grace, beautiful friendships, artistic community', avoid: 'Superficial social connections, popularity over substance', bestUse: 'Build friendships that nourish your creative and aesthetic life' },
  12: { leanInto: 'Hidden pleasures, artistic retreat, spiritual beauty', avoid: 'Secret affairs, escapism through pleasure', bestUse: 'Create art in solitude — beauty that comes from inner depths' },
};

export function generateActionGuidance(
  planetSRHouses: Record<string, number | null>,
  srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }>,
): ActionGuidance[] {
  const guidance: ActionGuidance[] = [];

  // Major planets with house-specific guidance
  const guidancePlanets = ['Sun', 'Mars', 'Saturn', 'Jupiter'];

  for (const planet of guidancePlanets) {
    const house = planetSRHouses[planet];
    if (!house) continue;

    const planetGuidance = PLANET_HOUSE_GUIDANCE[planet]?.[house];
    if (!planetGuidance) continue;

    const isRx = srPlanets[planet]?.isRetrograde;
    const sign = srPlanets[planet]?.sign || '';

    guidance.push({
      placement: `${planet} in SR ${house}${getOrdinal(house)} House${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: PLANET_SYMBOLS[planet] || planet,
      ...planetGuidance,
      timing: isRx ? `${planet} retrograde adds a "review and revise" quality — internal processing before external action` : undefined,
    });
  }

  // Venus
  const venusHouse = planetSRHouses['Venus'];
  if (venusHouse && VENUS_GUIDANCE[venusHouse]) {
    const isRx = srPlanets['Venus']?.isRetrograde;
    const sign = srPlanets['Venus']?.sign || '';
    guidance.push({
      placement: `Venus in SR ${venusHouse}${getOrdinal(venusHouse)} House${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: '♀',
      ...VENUS_GUIDANCE[venusHouse],
      timing: isRx ? 'Venus retrograde may revisit past relationships or values — reassess before committing' : undefined,
    });
  }

  return guidance;
}

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
