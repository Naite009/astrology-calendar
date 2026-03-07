// 96 Moon Archetypes — Raven Kaldera, "Moon Phase Astrology: The Lunar Key to Your Destiny"
// Each combination of Moon phase + zodiac sign produces a unique archetype name.

export interface MoonArchetype {
  name: string;
  essence: string;
}

/**
 * Kaldera's 8 phase labels mapped to the app's internal phase names.
 * His "Crescent" = our "Waxing Crescent", "Waking Quarter" = "First Quarter",
 * "Gibbous" = "Waxing Gibbous", "Disseminating" = "Waning Gibbous",
 * "Waning Quarter" = "Last Quarter", "Balsamic" = "Balsamic".
 */
export const MOON_PHASE_SIGN_ARCHETYPES: Record<string, Record<string, MoonArchetype>> = {
  // ──────────────────────────────────────────────────
  // 1 · NEW MOON — "In the Beginning"
  // ──────────────────────────────────────────────────
  'New Moon': {
    Aries:       { name: "Infant's Moon",           essence: "Pure impulse — the spark of new life before thought intervenes. Brave, raw, and utterly present." },
    Taurus:      { name: "Dryad's Moon",            essence: "The young tree spirit rooting down into the Earth for the first time. Sensual innocence and stubborn beauty." },
    Gemini:      { name: "Little Brother's Moon",   essence: "Curiosity in its purest form — the child asking 'why?' a hundred times. Quick, restless, delighted." },
    Cancer:      { name: "Mother's Daughter Moon",  essence: "Deep emotional bonding — learning love through being held. Tender, intuitive, fiercely loyal." },
    Leo:         { name: "Sun Child's Moon",         essence: "The born performer, radiating warmth before knowing the word 'audience.' Playful royalty." },
    Virgo:       { name: "Maiden's Moon",           essence: "The careful observer taking stock of the world with fresh, discerning eyes. Modest and precise." },
    Libra:       { name: "White Knight's Moon",     essence: "Idealistic quest for fairness and beauty — the soul that believes in a just world." },
    Scorpio:     { name: "Raging Moon",             essence: "Primal emotional intensity breaking through — raw power before it learns control." },
    Sagittarius: { name: "Gypsy's Moon",            essence: "Born wanderer — restless spirit that must roam before it can know home." },
    Capricorn:   { name: "Forgotten One's Moon",    essence: "The child who learned self-reliance too early — serious, watchful, quietly strong." },
    Aquarius:    { name: "Father's Son Moon",       essence: "The intellectual child reaching for ideas bigger than itself — maverick from birth." },
    Pisces:      { name: "Dreamer's Moon",          essence: "Born between worlds — the soul that arrives already half in the spirit realm." },
  },

  // ──────────────────────────────────────────────────
  // 2 · WAXING CRESCENT — "Call to Action"
  // ──────────────────────────────────────────────────
  'Waxing Crescent': {
    Aries:       { name: "Torch-Bearer's Moon",      essence: "Carrying the flame forward — courage that lights the way for others." },
    Taurus:      { name: "Gardener's Moon",          essence: "Patient cultivation — the one who plants seeds knowing they must wait for harvest." },
    Gemini:      { name: "Little Sister's Moon",     essence: "Quick-witted adaptation — learning to survive through cleverness and charm." },
    Cancer:      { name: "Mother's Son Moon",        essence: "Fighting to protect what is loved — fierce nurturing disguised as gentleness." },
    Leo:         { name: "Clown's Moon",             essence: "Joy as a weapon against darkness — the performer who heals through laughter." },
    Virgo:       { name: "Apprentice's Moon",        essence: "Humble dedication to craft — the student who serves in order to master." },
    Libra:       { name: "Dancer's Moon",            essence: "Grace under pressure — finding balance through movement and beauty." },
    Scorpio:     { name: "Blood Moon",               essence: "Survival at its most primal — the will to endure what would destroy others." },
    Sagittarius: { name: "Traveler's Moon",          essence: "Setting out on the great journey — faith that the road will provide." },
    Capricorn:   { name: "Mountain Climber's Moon",  essence: "Disciplined ascent — the one who reaches the summit through sheer persistence." },
    Aquarius:    { name: "Father's Daughter Moon",   essence: "Inheriting the intellectual mantle — the rebel who challenges the father's world." },
    Pisces:      { name: "Mermaid Moon",             essence: "Swimming between two worlds — the amphibious soul equally at home in feeling and form." },
  },

  // ──────────────────────────────────────────────────
  // 3 · FIRST QUARTER — "Internal Crisis"
  // ──────────────────────────────────────────────────
  'First Quarter': {
    Aries:       { name: "Brigand's Moon",           essence: "Crisis demands boldness — the outlaw who breaks rules to survive and protect." },
    Taurus:      { name: "Woodcutter's Moon",        essence: "Hard work through resistance — clearing the forest to make room for growth." },
    Gemini:      { name: "Liar's Moon",              essence: "The crisis of truth and deception — learning that words have real power." },
    Cancer:      { name: "Weeping Moon",             essence: "Emotional crisis breaks the heart open — grief that eventually becomes compassion." },
    Leo:         { name: "Actor's Moon",              essence: "The crisis of authenticity — when the mask and the face must become one." },
    Virgo:       { name: "Counting Moon",            essence: "Crisis of precision — when every detail matters and nothing can be wasted." },
    Libra:       { name: "Black Knight's Moon",      essence: "The dark side of justice — fighting for balance through uncomfortable confrontation." },
    Scorpio:     { name: "Executioner's Moon",       essence: "Ruthless pruning — cutting away what is dead so the living can flourish." },
    Sagittarius: { name: "Seeker's Moon",            essence: "The crisis of meaning — when old beliefs shatter and new truth must be found." },
    Capricorn:   { name: "Miner's Moon",             essence: "Digging deep into the earth — extracting treasure from the most resistant rock." },
    Aquarius:    { name: "Rebel Moon",               essence: "The revolutionary crisis — when conformity becomes intolerable and freedom demands action." },
    Pisces:      { name: "Martyr's Moon",            essence: "Sacrificial crisis — learning the difference between sacred offering and self-destruction." },
  },

  // ──────────────────────────────────────────────────
  // 4 · WAXING GIBBOUS — "Soul's Redemption"
  // ──────────────────────────────────────────────────
  'Waxing Gibbous': {
    Aries:       { name: "Adventurer's Moon",        essence: "Refining courage — the warrior who learns strategy alongside bravery." },
    Taurus:      { name: "Farmer's Moon",            essence: "Perfecting abundance — the patient cultivator who tends crops with devotion." },
    Gemini:      { name: "Mercenary's Moon",         essence: "Honing the mind's edge — intelligence applied with precision and purpose." },
    Cancer:      { name: "Life-Giver's Moon",        essence: "Perfecting the art of nurture — creating life and sustaining it with devotion." },
    Leo:         { name: "Singer's Moon",            essence: "Refining self-expression — the voice that has learned to move hearts." },
    Virgo:       { name: "Housewife's Moon",         essence: "Sacred service perfected — finding divinity in the humble routines of care." },
    Libra:       { name: "Lover's Moon",             essence: "Perfecting relationship — the art of giving and receiving love in balance." },
    Scorpio:     { name: "Cloaked One's Moon",       essence: "Refining power — the adept who has learned to wield intensity wisely." },
    Sagittarius: { name: "Scholar's Moon",           essence: "Perfecting understanding — the seeker who organizes wisdom into teaching." },
    Capricorn:   { name: "Smith's Moon",             essence: "Mastering the craft — forging raw material into something enduring and useful." },
    Aquarius:    { name: "Trickster's Moon",         essence: "Refining genius — the innovator who perfects the art of disruption." },
    Pisces:      { name: "Poet's Moon",              essence: "Perfecting vision — translating the ineffable into words that touch the soul." },
  },

  // ──────────────────────────────────────────────────
  // 5 · FULL MOON — "Consummation"
  // ──────────────────────────────────────────────────
  'Full Moon': {
    Aries:       { name: "Warrior's Moon",           essence: "Courage fully illuminated — the battle is won or lost, but the warrior stands revealed." },
    Taurus:      { name: "Earth Mother's Moon",      essence: "Abundance made manifest — the harvest is in, the table is set, the body is honored." },
    Gemini:      { name: "Storyteller's Moon",       essence: "Communication at its peak — the tale is told, the audience is rapt, the truth is spoken." },
    Cancer:      { name: "Sea Mother's Moon",        essence: "Emotional fullness — the great tidal wave of feeling that nourishes all it touches." },
    Leo:         { name: "Queen's Moon",             essence: "Royal power fulfilled — the sovereign who has earned her throne through authentic self-expression." },
    Virgo:       { name: "Spinner's Moon",           essence: "Service perfected — the sacred thread that connects heaven and earth through humble work." },
    Libra:       { name: "Artist's Moon",            essence: "Beauty fully expressed — the masterwork revealed, the balance achieved, the aesthetic complete." },
    Scorpio:     { name: "Priestess's Moon",         essence: "Mystery fully embodied — the keeper of secrets who stands at the threshold between worlds." },
    Sagittarius: { name: "Priest's Moon",            essence: "Truth proclaimed — the teacher who has walked the path and can now guide others." },
    Capricorn:   { name: "Grandmother's Moon",       essence: "Authority earned through experience — the elder whose wisdom commands natural respect." },
    Aquarius:    { name: "Friendship Moon",          essence: "Connection beyond blood — the tribe united by shared vision rather than DNA." },
    Pisces:      { name: "Healer's Moon",            essence: "Compassion made whole — the wounded healer whose own suffering becomes medicine for others." },
  },

  // ──────────────────────────────────────────────────
  // 6 · WANING GIBBOUS — "The Greater Good" (Disseminating)
  // ──────────────────────────────────────────────────
  'Waning Gibbous': {
    Aries:       { name: "Soldier's Moon",           essence: "Courage in service — the warrior who fights not for glory but for others' freedom." },
    Taurus:      { name: "Builder's Moon",           essence: "Creating structures that outlast the maker — legacy through lasting work." },
    Gemini:      { name: "Scribe's Moon",            essence: "Recording wisdom for future generations — the keeper of knowledge who writes it down." },
    Cancer:      { name: "Shield-Father's Moon",     essence: "Protective nurture extended to community — the guardian of the vulnerable." },
    Leo:         { name: "King's Moon",              essence: "Leadership through generosity — the ruler who gives more than he takes." },
    Virgo:       { name: "Weaver's Moon",            essence: "Connecting disparate threads — service that creates patterns of wholeness." },
    Libra:       { name: "Ambassador's Moon",        essence: "Diplomacy as sacred art — bridging divides through grace and understanding." },
    Scorpio:     { name: "Witch's Moon",             essence: "Power shared as healing — the practitioner who teaches transformation." },
    Sagittarius: { name: "Philosopher's Moon",       essence: "Wisdom distilled and shared — the sage who makes the complex accessible." },
    Capricorn:   { name: "Grandfather's Moon",       essence: "Authority offered as mentorship — the elder who builds the next generation." },
    Aquarius:    { name: "Apostle's Moon",           essence: "Vision spread to the world — the radical teacher whose ideas change everything." },
    Pisces:      { name: "Moon of the Angel of Mercy", essence: "Unconditional compassion — the healer who asks nothing in return." },
  },

  // ──────────────────────────────────────────────────
  // 7 · LAST QUARTER — "Crisis of Consciousness"
  // ──────────────────────────────────────────────────
  'Last Quarter': {
    Aries:       { name: "Survivor's Moon",          essence: "The crisis of letting go of battle — the warrior who must learn peace." },
    Taurus:      { name: "Merchant's Moon",          essence: "Re-evaluating what has value — releasing attachment to material security." },
    Gemini:      { name: "Magician's Moon",          essence: "The crisis of truth vs. illusion — using knowledge to transform rather than deceive." },
    Cancer:      { name: "Widow's Moon",             essence: "Releasing old bonds — the grief that liberates by finally letting go of the past." },
    Leo:         { name: "Usurper's Moon",            essence: "The crisis of ego — when authority must be surrendered so something new can reign." },
    Virgo:       { name: "Fate's Moon",              essence: "Acceptance of imperfection — releasing the need to fix everything." },
    Libra:       { name: "Judge's Moon",             essence: "The crisis of fairness — when balance requires difficult verdicts." },
    Scorpio:     { name: "Madwoman's Moon",          essence: "The crisis of control — when power must be surrendered to transformation." },
    Sagittarius: { name: "Hunter's Moon",            essence: "The crisis of belief — when old truths are released to make room for new understanding." },
    Capricorn:   { name: "Miser's Moon",             essence: "Releasing attachment to status — when accomplishments must be let go." },
    Aquarius:    { name: "Heretic's Moon",           essence: "The revolutionary crisis of conscience — challenging even one's own revolution." },
    Pisces:      { name: "Moon of Lost Souls",       essence: "The crisis of dissolution — surrendering identity to the collective ocean." },
  },

  // ──────────────────────────────────────────────────
  // 8 · BALSAMIC — "Into the Deep"
  // ──────────────────────────────────────────────────
  'Balsamic': {
    Aries:       { name: "Veteran's Moon",           essence: "The elder warrior — courage refined into wisdom, scars worn as badges of honor." },
    Taurus:      { name: "Ancestor's Moon",          essence: "The keeper of roots — connected to the land and the lineage that came before." },
    Gemini:      { name: "Teacher's Moon",           essence: "Wisdom distilled to simplicity — the mind that has traveled far enough to speak plainly." },
    Cancer:      { name: "Keeper of Memories Moon",  essence: "Guardian of the emotional treasury — the soul that remembers everything and forgives everything." },
    Leo:         { name: "Bard's Moon",              essence: "The final performance — art created not for applause but as an offering to eternity." },
    Virgo:       { name: "Monk's Moon",              essence: "Sacred simplicity — service stripped of ego, devotion purified to its essence." },
    Libra:       { name: "Sacred Whore's Moon",      essence: "Love beyond judgment — the soul that has loved enough to transcend all conditions." },
    Scorpio:     { name: "Phoenix Moon",             essence: "Death and rebirth mastered — the soul that rises from its own ashes, again and again." },
    Sagittarius: { name: "Shaman's Moon",            essence: "Walking between worlds — the traveler who has journeyed so far inward they can heal others." },
    Capricorn:   { name: "Dragon's Moon",            essence: "Ancient power guarding ancient treasure — the soul that has earned its authority through lifetimes." },
    Aquarius:    { name: "Prophet's Moon",           essence: "Vision beyond time — the seer whose radical ideas will only be understood in the future." },
    Pisces:      { name: "Mystic's Moon",            essence: "Transparent to the divine — the soul that has dissolved so completely it becomes a pure channel." },
  },
};

/** Phase chapter descriptions from Kaldera */
export const PHASE_CHAPTER_TITLES: Record<string, string> = {
  'New Moon':         'In the Beginning',
  'Waxing Crescent':  'Call to Action',
  'First Quarter':    'Internal Crisis',
  'Waxing Gibbous':   "Soul's Redemption",
  'Full Moon':        'Consummation',
  'Waning Gibbous':   'The Greater Good',
  'Last Quarter':     'Crisis of Consciousness',
  'Balsamic':         'Into the Deep',
};

/** Lookup helper: get archetype for a phase+sign combo */
export function getKalderaArchetype(phase: string, sign: string): MoonArchetype | null {
  return MOON_PHASE_SIGN_ARCHETYPES[phase]?.[sign] ?? null;
}

/** Get all 8 archetypes for a given sign (one per phase) */
export function getArchetypesForSign(sign: string): { phase: string; archetype: MoonArchetype }[] {
  const phases = Object.keys(MOON_PHASE_SIGN_ARCHETYPES);
  return phases
    .map(phase => ({ phase, archetype: MOON_PHASE_SIGN_ARCHETYPES[phase]?.[sign] }))
    .filter((entry): entry is { phase: string; archetype: MoonArchetype } => !!entry.archetype);
}

/** Get all 12 archetypes for a given phase (one per sign) */
export function getArchetypesForPhase(phase: string): { sign: string; archetype: MoonArchetype }[] {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const phaseData = MOON_PHASE_SIGN_ARCHETYPES[phase];
  if (!phaseData) return [];
  return signs.map(sign => ({ sign, archetype: phaseData[sign] })).filter(e => !!e.archetype);
}
