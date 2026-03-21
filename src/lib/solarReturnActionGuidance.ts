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

const MOON_GUIDANCE: Record<number, HouseGuidance> = {
  1: { leanInto: 'Emotional authenticity, showing how you really feel, body awareness', avoid: 'Mood swings driving major decisions, emotional reactivity', bestUse: 'Let your feelings guide your personal reinvention — your instincts about who you\'re becoming are sharp' },
  2: { leanInto: 'Comfort spending that nourishes, emotional relationship with money', avoid: 'Retail therapy, financial anxiety spirals', bestUse: 'Notice what you spend on when emotional — it reveals what you truly value' },
  3: { leanInto: 'Heartfelt conversations, intuitive writing, emotional connection with siblings', avoid: 'Overthinking, anxious texting, reading into every word', bestUse: 'Journal daily — your emotional processing happens through words this year' },
  4: { leanInto: 'Nesting, home cooking, family bonding, creating a sanctuary', avoid: 'Hiding at home to avoid the world, family enmeshment', bestUse: 'Make your home feel exactly right — your emotional health depends on your physical space this year' },
  5: { leanInto: 'Creative flow, playfulness, heartfelt romance, quality time with children', avoid: 'Drama for attention, emotional gambling, expecting others to fill your cup', bestUse: 'Create something from pure feeling — art, music, or a love letter that says what your heart means' },
  6: { leanInto: 'Intuitive health practices, emotionally satisfying work routines', avoid: 'Stress eating, worrying about health, compulsive organizing', bestUse: 'Build a daily routine that makes you feel emotionally cared for, not just productive' },
  7: { leanInto: 'Emotional vulnerability in partnerships, asking for what you need', avoid: 'Projecting your feelings onto your partner, emotional dependence', bestUse: 'Tell your partner (or closest person) one true feeling per day — this builds real intimacy' },
  8: { leanInto: 'Deep emotional processing, therapeutic breakthroughs, trust exercises', avoid: 'Emotional manipulation, obsessive fixation, refusing to let go', bestUse: 'Let yourself feel the hard feelings this year — they\'re clearing space for something better' },
  9: { leanInto: 'Feeling moved by new ideas, emotional travel experiences, philosophical wonder', avoid: 'Emotional preaching, using belief systems to avoid feeling', bestUse: 'Travel somewhere that makes you feel something — a place that moves you, not just entertains you' },
  10: { leanInto: 'Public emotional authenticity, being known for your warmth', avoid: 'Emotional displays at work, letting moods affect your professional reputation', bestUse: 'Lead with empathy at work — your emotional intelligence is a career asset this year' },
  11: { leanInto: 'Emotional investment in friendships, caring about your community', avoid: 'Taking group dynamics personally, needing friends to be your therapists', bestUse: 'Find a community where you feel emotionally safe — belonging matters deeply this year' },
  12: { leanInto: 'Rich inner emotional life, vivid dreams, quiet spiritual feelings', avoid: 'Unexplained sadness, isolating instead of processing, emotional martyrdom', bestUse: 'Give yourself permission to feel without explaining — some emotions just need space, not analysis' },
};

const URANUS_GUIDANCE: Record<number, HouseGuidance> = {
  1: { leanInto: 'Reinventing your image, trying unexpected things, embracing what makes you different', avoid: 'Changing everything at once, alienating people with sudden shifts', bestUse: 'Experiment with who you\'re becoming — but give people time to adjust' },
  2: { leanInto: 'New income streams, unconventional money moves, redefining what\'s valuable', avoid: 'Financial impulsiveness, quitting stable income on a whim', bestUse: 'Test one new earning idea without burning your safety net' },
  3: { leanInto: 'Original ideas, surprising conversations, learning something completely new', avoid: 'Scattered thinking, saying shocking things for effect', bestUse: 'Start the project or conversation that\'s been feeling too weird — it\'s not' },
  4: { leanInto: 'Home changes, shaking up family patterns, creating a more authentic living space', avoid: 'Moving impulsively, blowing up family relationships', bestUse: 'Rearrange your living space to match who you\'re becoming, not who you were' },
  5: { leanInto: 'Experimental creativity, unconventional romance, surprising joys', avoid: 'Thrill-seeking that risks real stability, treating people as experiments', bestUse: 'Create something nobody\'s seen before — your originality is at peak this year' },
  6: { leanInto: 'Overhauling routines, trying alternative wellness, tech-enhanced productivity', avoid: 'Abandoning all structure, rebelling against your own health needs', bestUse: 'Redesign one daily habit from scratch — sometimes disruption IS the solution' },
  7: { leanInto: 'Honest relationship shakeups, more freedom in partnerships, unconventional agreements', avoid: 'Breaking commitments on impulse, using "I need freedom" as an excuse to avoid intimacy', bestUse: 'Have the conversation about what you actually need — the relationship can handle honesty' },
  8: { leanInto: 'Sudden financial shifts that free you, breakthrough therapy moments', avoid: 'Reckless financial risks, forcing transformation', bestUse: 'Be open to the unexpected inheritance, insurance payout, or emotional breakthrough' },
  9: { leanInto: 'Radical new perspectives, spontaneous travel, mind-expanding experiences', avoid: 'Extremist thinking, abandoning all your beliefs at once', bestUse: 'Go somewhere or study something that completely changes how you see the world' },
  10: { leanInto: 'Career pivots, public reinvention, stepping into a unique professional role', avoid: 'Quitting without a plan, burning professional bridges', bestUse: 'Make the career move that feels scary but authentic — your public role wants to evolve' },
  11: { leanInto: 'New friend groups, joining unconventional communities, activist energy', avoid: 'Cutting off all old friends, social rebellion without purpose', bestUse: 'Find your real people this year — the ones who get the real you' },
  12: { leanInto: 'Inner awakening, surprising spiritual insights, liberation from old patterns', avoid: 'Spiritual bypassing, using "enlightenment" to avoid real-world responsibilities', bestUse: 'Pay attention to sudden insights during quiet moments — your subconscious is doing important work' },
};

const NEPTUNE_GUIDANCE: Record<number, HouseGuidance> = {
  1: { leanInto: 'Compassionate self-image, artistic self-expression, softening your edges', avoid: 'Identity confusion, losing yourself in others\' expectations, substance use', bestUse: 'Let yourself be a little mysterious this year — you don\'t have to define yourself for anyone' },
  2: { leanInto: 'Creative income, generous giving, aligning money with meaning', avoid: 'Financial confusion, lending money you can\'t afford, unclear contracts', bestUse: 'Double-check every financial document — and explore earning through creativity or healing' },
  3: { leanInto: 'Poetic communication, intuitive learning, compassionate listening', avoid: 'Miscommunication, believing everything you hear, foggy thinking', bestUse: 'Write from the heart — your words have an unusual power to move people this year' },
  4: { leanInto: 'Creating a dreamy home environment, emotional healing with family', avoid: 'Idealizing family, avoiding household responsibilities, boundary issues at home', bestUse: 'Make your home a sanctuary — soft lighting, good music, spaces that feel sacred' },
  5: { leanInto: 'Artistic inspiration, romantic idealism, imaginative play', avoid: 'Falling for fantasy instead of real people, creative escapism', bestUse: 'Create something that captures the beauty you see — art, music, photography, writing' },
  6: { leanInto: 'Holistic health practices, meaningful work, compassionate service', avoid: 'Ignoring symptoms, unclear work boundaries, self-medication', bestUse: 'Try one gentle wellness practice — yoga, swimming, massage, or guided meditation' },
  7: { leanInto: 'Compassionate partnership, seeing the best in your partner, spiritual connection', avoid: 'Seeing people as you wish they were, codependency, unclear agreements', bestUse: 'Love generously but keep one eye on reality — the best relationships are honest AND kind' },
  8: { leanInto: 'Spiritual transformation, surrendering control, emotional release', avoid: 'Financial confusion with others\' money, manipulation through emotions', bestUse: 'Let something old dissolve — you don\'t have to control everything that changes this year' },
  9: { leanInto: 'Spiritual travel, faith exploration, transcendent experiences', avoid: 'Guru worship, believing everything without discernment, escapist travel', bestUse: 'Visit a place that feeds your spirit, not just your Instagram' },
  10: { leanInto: 'Compassionate leadership, artistic career, being known for kindness', avoid: 'Career confusion, unclear professional goals, reputation for unreliability', bestUse: 'Lead with empathy and vision — people will remember how you made them feel' },
  11: { leanInto: 'Compassionate community involvement, artistic collaborations, idealistic friendship', avoid: 'Sacrificing yourself for groups, friends who drain your energy, unclear group roles', bestUse: 'Give your time to causes that genuinely move you — not obligations' },
  12: { leanInto: 'Deep meditation, vivid dreams, creative retreat, spiritual practice', avoid: 'Total withdrawal from life, addiction risks, martyrdom', bestUse: 'This is your most spiritually powerful position — create a daily practice and trust your dreams' },
};

const PLUTO_GUIDANCE: Record<number, HouseGuidance> = {
  1: { leanInto: 'Personal transformation, owning your power, deep self-honesty', avoid: 'Intimidating others, obsessive self-reinvention, control issues', bestUse: 'Let the old version of you go — the person emerging is more authentic and powerful' },
  2: { leanInto: 'Financial transformation, discovering hidden resources, redefining your worth', avoid: 'Obsessing over money, power struggles around possessions', bestUse: 'Transform your relationship with money — from scarcity to sufficiency' },
  3: { leanInto: 'Penetrating communication, research skills, uncovering hidden information', avoid: 'Obsessive thinking, verbal manipulation, paranoid interpretations', bestUse: 'Research something deeply — your ability to uncover truth is heightened' },
  4: { leanInto: 'Family healing, transforming your home, facing inherited patterns', avoid: 'Dredging up family trauma without support, controlling domestic life', bestUse: 'Heal one family pattern this year — the ripple effect changes everything' },
  5: { leanInto: 'Transformative creative work, passionate romance, deeply honest self-expression', avoid: 'Obsessive love, creative power struggles, using children to control', bestUse: 'Create something that comes from your deepest truth — it will be your most powerful work' },
  6: { leanInto: 'Health transformation, total routine overhaul, powerful daily habits', avoid: 'Orthorexia, workplace power struggles, obsessive health tracking', bestUse: 'Transform one health habit completely — this year your discipline has real staying power' },
  7: { leanInto: 'Relationship deepening, honest power dynamics, transformative partnerships', avoid: 'Controlling your partner, jealousy, power games in relationships', bestUse: 'Let a relationship evolve — if it survives honesty, it becomes unbreakable' },
  8: { leanInto: 'Deep psychological work, financial restructuring, facing what scares you', avoid: 'Obsession with control, manipulation, refusing to be vulnerable', bestUse: 'Face the thing you\'ve been avoiding — the freedom on the other side is real' },
  9: { leanInto: 'Transforming your worldview, deep philosophical study, meaningful travel', avoid: 'Fanaticism, using beliefs to control others, intellectual arrogance', bestUse: 'Let an old belief die so a truer one can take its place' },
  10: { leanInto: 'Career transformation, stepping into real authority, professional reinvention', avoid: 'Office politics, power plays, obsessing over status', bestUse: 'Claim the professional power you\'ve been tiptoeing around — you\'re ready for real authority' },
  11: { leanInto: 'Transforming your friend group, powerful community involvement, activist leadership', avoid: 'Trying to control groups, cutting people off dramatically, tribalism', bestUse: 'Let your social circle evolve — some relationships need to transform, not just end' },
  12: { leanInto: 'Deep subconscious work, therapeutic breakthroughs, spiritual transformation', avoid: 'Suppressing powerful feelings, paranoia, self-destructive tendencies', bestUse: 'The deepest healing happens in private this year — therapy, meditation, or honest journaling' },
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
      placement: `${planet} in your ${HOUSE_PLAIN[house]}${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: PLANET_SYMBOLS[planet] || planet,
      ...planetGuidance,
      timing: isRx ? 'This area is in review mode — internal processing before external action' : undefined,
    });
  }

  // Venus
  const venusHouse = planetSRHouses['Venus'];
  if (venusHouse && VENUS_GUIDANCE[venusHouse]) {
    const isRx = srPlanets['Venus']?.isRetrograde;
    const sign = srPlanets['Venus']?.sign || '';
    guidance.push({
      placement: `Your love and beauty energy in ${HOUSE_PLAIN[venusHouse]}${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: '♀',
      ...VENUS_GUIDANCE[venusHouse],
      timing: isRx ? 'Past relationships or values may resurface — reassess before committing' : undefined,
    });
  }

  // Moon
  const moonHouse = planetSRHouses['Moon'];
  if (moonHouse && MOON_GUIDANCE[moonHouse]) {
    const sign = srPlanets['Moon']?.sign || '';
    guidance.push({
      placement: `Your emotional focus in ${HOUSE_PLAIN[moonHouse]}${sign ? ` (${sign})` : ''}`,
      planetSymbol: '☽',
      ...MOON_GUIDANCE[moonHouse],
    });
  }

  // Uranus
  const uranusHouse = planetSRHouses['Uranus'];
  if (uranusHouse && URANUS_GUIDANCE[uranusHouse]) {
    const isRx = srPlanets['Uranus']?.isRetrograde;
    const sign = srPlanets['Uranus']?.sign || '';
    guidance.push({
      placement: `Unexpected change in ${HOUSE_PLAIN[uranusHouse]}${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: '♅',
      ...URANUS_GUIDANCE[uranusHouse],
      timing: isRx ? 'Changes are brewing internally — the visible shifts come later' : undefined,
    });
  }

  // Neptune
  const neptuneHouse = planetSRHouses['Neptune'];
  if (neptuneHouse && NEPTUNE_GUIDANCE[neptuneHouse]) {
    const isRx = srPlanets['Neptune']?.isRetrograde;
    const sign = srPlanets['Neptune']?.sign || '';
    guidance.push({
      placement: `Imagination and sensitivity in ${HOUSE_PLAIN[neptuneHouse]}${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: '♆',
      ...NEPTUNE_GUIDANCE[neptuneHouse],
      timing: isRx ? 'Inner spiritual and creative life is especially vivid' : undefined,
    });
  }

  // Pluto
  const plutoHouse = planetSRHouses['Pluto'];
  if (plutoHouse && PLUTO_GUIDANCE[plutoHouse]) {
    const isRx = srPlanets['Pluto']?.isRetrograde;
    const sign = srPlanets['Pluto']?.sign || '';
    guidance.push({
      placement: `Deep transformation in ${HOUSE_PLAIN[plutoHouse]}${sign ? ` (${sign})` : ''}${isRx ? ' ℞' : ''}`,
      planetSymbol: '♇',
      ...PLUTO_GUIDANCE[plutoHouse],
      timing: isRx ? 'Transformation is operating beneath the surface — trust the slow process' : undefined,
    });
  }

  return guidance;
}

const HOUSE_PLAIN: Record<number, string> = {
  1: 'identity and self-image', 2: 'finances and self-worth', 3: 'communication and learning',
  4: 'home and family', 5: 'creativity and romance', 6: 'health and daily routines',
  7: 'partnerships and relationships', 8: 'shared resources and deep change', 9: 'travel and big-picture goals',
  10: 'career and public role', 11: 'friendships and community', 12: 'inner work and quiet reflection',
};

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
