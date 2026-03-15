/**
 * Generates a personalized "felt-sense" title + description for each
 * planet-sign-house combination in the Solar Return Planet Gallery.
 *
 * Structure: Planet (what) + Sign (how) + House (where) = one cohesive sentence + name.
 */

// ── Planet core drives ──────────────────────────────────────────────
const PLANET_DRIVE: Record<string, { verb: string; domain: string }> = {
  Sun:       { verb: 'expresses',    domain: 'identity and purpose' },
  Moon:      { verb: 'processes',    domain: 'emotions and needs' },
  Mercury:   { verb: 'communicates', domain: 'thinking and perception' },
  Venus:     { verb: 'attracts',     domain: 'love and values' },
  Mars:      { verb: 'pursues',      domain: 'desire and action' },
  Jupiter:   { verb: 'expands',      domain: 'growth and meaning' },
  Saturn:    { verb: 'structures',   domain: 'discipline and mastery' },
  Uranus:    { verb: 'disrupts',     domain: 'freedom and innovation' },
  Neptune:   { verb: 'dissolves',    domain: 'imagination and transcendence' },
  Pluto:     { verb: 'transforms',   domain: 'power and rebirth' },
  Chiron:    { verb: 'heals',        domain: 'your deepest wound' },
  NorthNode: { verb: 'pulls toward', domain: 'soul growth' },
};

// ── Sign style (how the planet operates) ────────────────────────────
const SIGN_STYLE: Record<string, { adverb: string; flavor: string; archetype: string }> = {
  Aries:       { adverb: 'boldly',         flavor: 'raw courage and instinct',       archetype: 'The Pioneer' },
  Taurus:      { adverb: 'steadily',       flavor: 'patience and sensory richness',  archetype: 'The Builder' },
  Gemini:      { adverb: 'curiously',      flavor: 'quick wit and versatility',      archetype: 'The Messenger' },
  Cancer:      { adverb: 'protectively',   flavor: 'emotional depth and nurturing',  archetype: 'The Nurturer' },
  Leo:         { adverb: 'radiantly',      flavor: 'warmth and creative confidence', archetype: 'The Performer' },
  Virgo:       { adverb: 'precisely',      flavor: 'refinement and practical care',  archetype: 'The Analyst' },
  Libra:       { adverb: 'gracefully',     flavor: 'harmony and relational finesse', archetype: 'The Diplomat' },
  Scorpio:     { adverb: 'intensely',      flavor: 'psychological depth and power',  archetype: 'The Alchemist' },
  Sagittarius: { adverb: 'adventurously',  flavor: 'expansive vision and honesty',   archetype: 'The Explorer' },
  Capricorn:   { adverb: 'deliberately',   flavor: 'strategic ambition and grit',    archetype: 'The Architect' },
  Aquarius:    { adverb: 'unconventionally', flavor: 'originality and detachment',   archetype: 'The Visionary' },
  Pisces:      { adverb: 'intuitively',    flavor: 'compassion and spiritual sensitivity', archetype: 'The Mystic' },
};

// ── House arena (where it plays out) ────────────────────────────────
const HOUSE_ARENA: Record<number, { where: string; life: string }> = {
  1:  { where: 'in your body, appearance, and first impressions',      life: 'Self' },
  2:  { where: 'through money, possessions, and self-worth',           life: 'Resources' },
  3:  { where: 'through conversations, learning, and your neighborhood', life: 'Mind' },
  4:  { where: 'at home, in family dynamics, and private foundations',  life: 'Roots' },
  5:  { where: 'through creativity, romance, and joyful self-expression', life: 'Play' },
  6:  { where: 'in daily routines, health habits, and service',        life: 'Craft' },
  7:  { where: 'through partnerships, contracts, and one-on-one bonds', life: 'Partnership' },
  8:  { where: 'in shared resources, intimacy, and psychological depths', life: 'Depths' },
  9:  { where: 'through travel, philosophy, and higher education',     life: 'Horizon' },
  10: { where: 'in career, public reputation, and life direction',     life: 'Legacy' },
  11: { where: 'through friendships, community, and future visions',   life: 'Tribe' },
  12: { where: 'in solitude, spiritual practice, and the unconscious', life: 'Inner World' },
};

// ── Planet-sign evocative name combos ──────────────────────────────
const PLANET_SIGN_NAMES: Record<string, Record<string, string>> = {
  Sun: {
    Aries: 'The Trailblazer', Taurus: 'The Grounded King', Gemini: 'The Storyteller',
    Cancer: 'The Guardian', Leo: 'The Radiant One', Virgo: 'The Craftsman',
    Libra: 'The Peacemaker', Scorpio: 'The Phoenix', Sagittarius: 'The Seeker',
    Capricorn: 'The Authority', Aquarius: 'The Rebel Luminary', Pisces: 'The Dreamer',
  },
  Moon: {
    Aries: 'The Warrior Heart', Taurus: 'The Comfort Seeker', Gemini: 'The Restless Soul',
    Cancer: 'The Deep Well', Leo: 'The Warm Hearth', Virgo: 'The Quiet Healer',
    Libra: 'The Peacekeeper', Scorpio: 'The Emotional Detective', Sagittarius: 'The Free Spirit',
    Capricorn: 'The Stoic Heart', Aquarius: 'The Detached Observer', Pisces: 'The Empath',
  },
  Mercury: {
    Aries: 'The Quick Draw', Taurus: 'The Slow Thinker', Gemini: 'The Natural Communicator',
    Cancer: 'The Memory Keeper', Leo: 'The Dramatic Speaker', Virgo: 'The Precision Mind',
    Libra: 'The Mediator', Scorpio: 'The Investigator', Sagittarius: 'The Philosopher',
    Capricorn: 'The Strategist', Aquarius: 'The Innovator', Pisces: 'The Poet',
  },
  Venus: {
    Aries: 'The Bold Lover', Taurus: 'The Sensualist', Gemini: 'The Flirtatious Mind',
    Cancer: 'The Devoted Heart', Leo: 'The Generous Lover', Virgo: 'The Thoughtful Partner',
    Libra: 'The Romantic Idealist', Scorpio: 'The Passionate Bond', Sagittarius: 'The Adventurous Heart',
    Capricorn: 'The Loyal Investor', Aquarius: 'The Unconventional Lover', Pisces: 'The Romantic Dreamer',
  },
  Mars: {
    Aries: 'The Unstoppable Force', Taurus: 'The Immovable Will', Gemini: 'The Quick Strike',
    Cancer: 'The Protective Fighter', Leo: 'The Fearless Leader', Virgo: 'The Precision Strike',
    Libra: 'The Strategic Fighter', Scorpio: 'The Silent Power', Sagittarius: 'The Crusader',
    Capricorn: 'The Relentless Climber', Aquarius: 'The Revolutionary', Pisces: 'The Gentle Warrior',
  },
  Jupiter: {
    Aries: 'The Bold Expansion', Taurus: 'The Abundant Garden', Gemini: 'The Knowledge Seeker',
    Cancer: 'The Generous Nurturer', Leo: 'The Grand Opportunity', Virgo: 'The Humble Growth',
    Libra: 'The Social Blessing', Scorpio: 'The Deep Reward', Sagittarius: 'The Great Teacher',
    Capricorn: 'The Earned Fortune', Aquarius: 'The Collective Gift', Pisces: 'The Infinite Well',
  },
  Saturn: {
    Aries: 'The Disciplined Warrior', Taurus: 'The Patient Builder', Gemini: 'The Focused Mind',
    Cancer: 'The Emotional Architect', Leo: 'The Humble King', Virgo: 'The Master Craftsman',
    Libra: 'The Relationship Builder', Scorpio: 'The Power Forger', Sagittarius: 'The Wisdom Seeker',
    Capricorn: 'The Mountain Climber', Aquarius: 'The System Builder', Pisces: 'The Spiritual Anchor',
  },
  Uranus: {
    Aries: 'The Lightning Strike', Taurus: 'The Earthquake', Gemini: 'The Mental Revolution',
    Cancer: 'The Home Disruptor', Leo: 'The Creative Rebel', Virgo: 'The System Hacker',
    Libra: 'The Relationship Rebel', Scorpio: 'The Deep Shock', Sagittarius: 'The Freedom Fighter',
    Capricorn: 'The Structure Breaker', Aquarius: 'The True Original', Pisces: 'The Spiritual Awakener',
  },
  Neptune: {
    Aries: 'The Inspired Warrior', Taurus: 'The Beautiful Dream', Gemini: 'The Poetic Mind',
    Cancer: 'The Psychic Home', Leo: 'The Creative Muse', Virgo: 'The Healing Service',
    Libra: 'The Romantic Illusion', Scorpio: 'The Deep Mystic', Sagittarius: 'The Vision Quest',
    Capricorn: 'The Dissolving Structure', Aquarius: 'The Collective Dream', Pisces: 'The Ocean of Feeling',
  },
  Pluto: {
    Aries: 'The Total Rebirth', Taurus: 'The Value Upheaval', Gemini: 'The Mind Transformer',
    Cancer: 'The Root Surgery', Leo: 'The Power Reclamation', Virgo: 'The Purification',
    Libra: 'The Relationship Reckoning', Scorpio: 'The Ultimate Transformation', Sagittarius: 'The Truth Bomb',
    Capricorn: 'The Power Shift', Aquarius: 'The Collective Metamorphosis', Pisces: 'The Spiritual Death-Rebirth',
  },
  Chiron: {
    Aries: 'The Identity Healer', Taurus: 'The Worth Restorer', Gemini: 'The Voice Reclaimer',
    Cancer: 'The Emotional Mender', Leo: 'The Confidence Healer', Virgo: 'The Perfectionism Release',
    Libra: 'The Partnership Healer', Scorpio: 'The Trauma Alchemist', Sagittarius: 'The Meaning Maker',
    Capricorn: 'The Achievement Healer', Aquarius: 'The Belonging Wound', Pisces: 'The Compassion Teacher',
  },
  NorthNode: {
    Aries: 'The Independence Path', Taurus: 'The Self-Worth Journey', Gemini: 'The Curiosity Calling',
    Cancer: 'The Emotional Courage Path', Leo: 'The Visibility Lesson', Virgo: 'The Service Discovery',
    Libra: 'The Partnership Lesson', Scorpio: 'The Surrender Path', Sagittarius: 'The Expansion Calling',
    Capricorn: 'The Mastery Path', Aquarius: 'The Individuation Journey', Pisces: 'The Surrender Lesson',
  },
};

/**
 * Returns an evocative name and a personalized felt-sense description
 * for a planet placed in a specific sign and house.
 */
export function getPlanetSignHouseFelt(
  planet: string, sign: string, house: number | undefined
): { name: string; description: string } {
  const drive = PLANET_DRIVE[planet] || { verb: 'activates', domain: 'this area of life' };
  const style = SIGN_STYLE[sign] || { adverb: 'distinctly', flavor: 'unique energy', archetype: 'The Awakener' };
  const arena = house ? HOUSE_ARENA[house] : null;

  const name = PLANET_SIGN_NAMES[planet]?.[sign] || `${style.archetype}`;

  // Build the felt-sense description
  const planetName = planet === 'NorthNode' ? 'The North Node' : planet;
  const houseClause = arena
    ? `This year, ${planetName} ${drive.verb} ${drive.domain} ${style.adverb} ${arena.where}. ${sign} brings ${style.flavor} to the ${arena.life} sector of your life.`
    : `This year, ${planetName} ${drive.verb} ${drive.domain} ${style.adverb}, filtered through ${sign}'s ${style.flavor}.`;

  return { name, description: houseClause };
}
