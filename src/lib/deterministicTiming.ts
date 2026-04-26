import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';
import { formatFutureTransitsContext, scanFutureTransits } from './futureTransitScanner';
import { getPlanetLongitudeExact, normalizeLongitude } from './transitMath';
import {
  TimingTransitSchema,
  TimingWindowSchema,
  validateEntries,
  assertTimingSectionIsClean,
} from './timingEntryValidator';
import { dedupWindows } from './timingWindowDedup';

const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const PLANET_SYMBOLS: Record<string, string> = {
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const TRANSIT_BODIES: Record<string, Astronomy.Body> = {
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: 'Pluto' as Astronomy.Body,
};

export type TimingReadingType =
  | 'relationship'
  | 'relocation'
  | 'career'
  | 'health'
  | 'money'
  | 'spiritual'
  | 'natal'
  | 'general';

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4 helper — humanize date ranges (replace en/em dashes between dates with " to ")
// ─────────────────────────────────────────────────────────────────────────────
const humanizeDateRange = (value: string): string => {
  if (!value) return value;
  // Replace en-dash and em-dash that sit between date tokens with " to "
  return value.replace(/\s*[–—]\s*/g, ' to ');
};

// ─────────────────────────────────────────────────────────────────────────────
// Natal theme maps (per reading type)
// ─────────────────────────────────────────────────────────────────────────────
const NATAL_THEME_MAP: Record<string, string> = {
  Sun: 'how you show up in the relationship — your confidence, ego, and sense of being seen by your partner',
  Moon: 'your emotional safety, what you need to feel held, and how you behave at home with the person closest to you',
  Mercury: 'the way you talk, listen, and make decisions with a partner — the conversations you keep replaying',
  Venus: 'attraction, closeness, affection, what you value in love, and how easy it is to receive it',
  Mars: 'desire, sex, conflict, and how directly you go after — or argue for — what you want from someone',
  Jupiter: 'where you let yourself believe a relationship can grow — your appetite for more, and the risk of overpromising or overlooking real flags',
  Saturn: 'how seriously you take commitment — the rules you have set for love, the walls you have built, and what you are actually willing to build with someone',
  Uranus: 'your need for space, freedom, and surprise inside intimacy — the part of you that pulls away the moment things get too defined',
  Neptune: 'your tendency to idealize a partner, fall in love with potential, and lose your own outline inside someone else',
  Pluto: 'the deepest power dynamics in your love life — control, intensity, jealousy, fear of being known, and the patterns that repeat until they are seen',
  Chiron: 'the old wound that gets touched in close relationships — the place where love lands on something already tender',
  NorthNode: 'the kind of partnership you are growing toward — the relational experience your life is asking you to step into',
  'North Node': 'the kind of partnership you are growing toward — the relational experience your life is asking you to step into',
  SouthNode: 'the relational pattern you keep defaulting to — comfortable, familiar, and quietly outgrown',
  'South Node': 'the relational pattern you keep defaulting to — comfortable, familiar, and quietly outgrown',
  Ascendant: 'the version of you the other person meets first — the front door of your personality in any relationship',
  ASC: 'the version of you the other person meets first — the front door of your personality in any relationship',
  Descendant: 'the kind of partner you keep attracting and the qualities you keep meeting through other people',
  DSC: 'the kind of partner you keep attracting and the qualities you keep meeting through other people',
  Midheaven: 'how your public life and direction interact with your relationship — what you are building out in the world that a partner has to make room for',
  MC: 'how your public life and direction interact with your relationship — what you are building out in the world that a partner has to make room for',
  IC: 'your private inner life and what you need at home — the part of you only the closest person ever sees',
};

const NATAL_THEME_MAP_RELOCATION: Record<string, string> = {
  Sun: 'your visibility, identity, and sense of purpose in a new city',
  Moon: 'your sense of home, belonging, and what makes a place feel emotionally safe and settled',
  Mercury: 'communication, community, and mental stimulation in your daily environment',
  Venus: 'the aesthetic, social, and lifestyle quality of your environment',
  Mars: 'your energy, drive, and how much effort daily life in a new place requires',
  Jupiter: 'expansion, opportunity, and whether a place opens doors or closes them',
  Saturn: 'commitment, structure, and what you are willing to build in a new place',
};

const NATAL_THEME_MAP_CAREER: Record<string, string> = {
  Sun: 'your identity, visibility, and sense of purpose in your career',
  Moon: 'your emotional relationship to work, what makes you feel secure professionally, and how your inner state affects your output',
  Mercury: 'communication, decisions, and the mental demands of your work',
  Venus: 'your values, what work feels rewarding, and how you relate to colleagues and collaborators',
  Mars: 'your drive, ambition, conflict at work, and how directly you go after what you want professionally',
  Jupiter: 'opportunity, expansion, and growth in your professional life',
  Saturn: 'structure, discipline, career limits, and what you are being asked to build or prove',
  Uranus: 'your appetite for professional disruption — innovation, sudden pivots, and the pull to break from a role that has become too defined',
  Neptune: 'professional vision and direction — where inspiration is real and where idealism could blur a clean read on the work',
  Pluto: 'the deeper power dynamics of your work — authority, influence, control, and the work you are meant to do at depth',
  Chiron: 'the place at work that touches an old professional wound — competence, recognition, or being taken seriously',
  NorthNode: 'the professional direction your life is genuinely pulling you toward, even when it is uncomfortable',
  'North Node': 'the professional direction your life is genuinely pulling you toward, even when it is uncomfortable',
  SouthNode: 'the kind of work you can do in your sleep — easy, familiar, and possibly no longer the right fit',
  'South Node': 'the kind of work you can do in your sleep — easy, familiar, and possibly no longer the right fit',
  Ascendant: 'how you present professionally and the first impression you make in any work context',
  ASC: 'how you present professionally and the first impression you make in any work context',
  Midheaven: 'your public role, career direction, and what the world recognizes you for',
  MC: 'your public role, career direction, and what the world recognizes you for',
  IC: 'the private foundation underneath your career — what makes work sustainable from the inside',
  Descendant: 'work partnerships, clients, and the kinds of professional others you keep meeting',
  DSC: 'work partnerships, clients, and the kinds of professional others you keep meeting',
};

const NATAL_THEME_MAP_HEALTH: Record<string, string> = {
  Sun: 'vitality, immune resilience, and your overall life force',
  Moon: 'emotional patterns that affect your physical body, stress responses, and what you need to feel restored',
  Mercury: 'the nervous system, mental load, and how overthinking affects the body',
  Venus: 'pleasure, rest, and the lifestyle habits that either nourish or drain you',
  Mars: 'physical energy, inflammation, overexertion, and how you use and deplete your body',
  Jupiter: 'excess, expansion, and where the body may need moderation',
  Saturn: 'chronic patterns, structural health, bones, skin, and what requires long-term management',
  Uranus: 'sudden shifts in the body — sleep, energy spikes, electrical or nervous-system flares',
  Neptune: 'the diffuse, hard-to-pin-down side of health — sensitivity, allergies, immunity, and the risk of self-medicating',
  Pluto: 'the deepest patterns in the body — what has been buried, suppressed, or asking for true regeneration',
  Chiron: 'the chronic place in the body that you have learned to manage — the wound that also teaches',
  NorthNode: 'the way of caring for yourself you are growing into',
  'North Node': 'the way of caring for yourself you are growing into',
  SouthNode: 'the health habits you default to — easy, familiar, and possibly past their usefulness',
  'South Node': 'the health habits you default to — easy, familiar, and possibly past their usefulness',
  Ascendant: 'the body itself — physical presence, vitality, and overall constitution',
  ASC: 'the body itself — physical presence, vitality, and overall constitution',
  Midheaven: 'how stress from public life and career lands in the body',
  MC: 'how stress from public life and career lands in the body',
  IC: 'your private rest, recovery, and the home environment as a healing space',
  Descendant: 'how relationship dynamics show up in the body',
  DSC: 'how relationship dynamics show up in the body',
};

const NATAL_THEME_MAP_MONEY: Record<string, string> = {
  Sun: 'financial identity, how visible your earnings are, and your sense of worth',
  Moon: 'emotional spending, financial security, and what money means to you at a feeling level',
  Mercury: 'financial decisions, contracts, and the information you act on',
  Venus: 'what you value, how you spend, and where money flows most naturally toward',
  Mars: 'financial drive, risk-taking, and how aggressively you pursue income',
  Jupiter: 'financial opportunity, expansion, and where abundance or excess is most likely',
  Saturn: 'financial discipline, debt, long-term building, and what requires patient investment',
  Uranus: 'sudden financial shifts — windfalls, losses, or unconventional income streams',
  Neptune: 'where money gets foggy — investments, fantasies, generosity, and the risk of being financially naive',
  Pluto: 'the deepest power dynamics around money — debt, inheritance, shared resources, and control',
  Chiron: 'the old wound around money, scarcity, or worth that keeps shaping financial decisions',
  NorthNode: 'the financial direction your life is genuinely pulling you toward',
  'North Node': 'the financial direction your life is genuinely pulling you toward',
  SouthNode: 'the financial pattern you default to — comfortable but possibly past its usefulness',
  'South Node': 'the financial pattern you default to — comfortable but possibly past its usefulness',
  Ascendant: 'how you project worth and value in the world',
  ASC: 'how you project worth and value in the world',
  Midheaven: 'income tied to your public role and career direction',
  MC: 'income tied to your public role and career direction',
  IC: 'your private financial foundation and sense of security at home',
  Descendant: 'shared finances, partnerships, and money tied to other people',
  DSC: 'shared finances, partnerships, and money tied to other people',
};

const NATAL_THEME_MAP_SPIRITUAL: Record<string, string> = {
  Sun: 'soul purpose, identity beyond ego, and what you are here to express',
  Moon: 'emotional depth, intuition, and what nourishes your inner life',
  Mercury: "the mind's role in spiritual practice, discernment, and inner knowing",
  Venus: 'beauty, devotion, and what connects you to something larger than yourself',
  Mars: 'spiritual will, practice, and what drives your inner search',
  Jupiter: 'faith, meaning, expansion of consciousness, and what opens you spiritually',
  Saturn: 'spiritual discipline, karmic patterns, and what demands honest inner work',
  Uranus: 'sudden insight, awakening, and the parts of your spirituality that refuse to fit any tradition',
  Neptune: 'mystical experience, dissolution of self, and the porous edge between you and the larger field',
  Pluto: 'the most transformative inner work — what dies in you so something truer can emerge',
  Chiron: 'the spiritual wound that becomes the source of your real teaching',
  NorthNode: 'the inner direction your soul is growing toward in this life',
  'North Node': 'the inner direction your soul is growing toward in this life',
  SouthNode: 'the spiritual gifts and patterns you arrived with — already known, sometimes leaned on too long',
  'South Node': 'the spiritual gifts and patterns you arrived with — already known, sometimes leaned on too long',
  Ascendant: 'the way your inner life shows through your outer presence',
  ASC: 'the way your inner life shows through your outer presence',
  Midheaven: 'how your spiritual orientation shapes your purpose in the world',
  MC: 'how your spiritual orientation shapes your purpose in the world',
  IC: 'your most private spiritual life — what only you and the dark know',
  Descendant: 'spiritual learning that comes through other people',
  DSC: 'spiritual learning that comes through other people',
};

const NATAL_THEME_MAP_GENERAL: Record<string, string> = {
  Sun: 'your identity, vitality, and sense of purpose',
  Moon: 'your emotional needs, inner life, and what makes you feel safe',
  Mercury: 'how you think, communicate, and process information',
  Venus: 'what you value, how you connect, and what brings you pleasure',
  Mars: 'your drive, desire, and how you go after what you want',
  Jupiter: 'where you grow, expand, and find opportunity',
  Saturn: 'where you commit, build structure, and face responsibility',
  Uranus: 'your need for freedom, originality, and the part of you that breaks from convention',
  Neptune: 'your imagination, sensitivity, and the place where self dissolves into something larger',
  Pluto: 'the deepest layer of yourself — power, transformation, and what is being remade at the root',
  Chiron: 'the old wound that becomes your source of compassion and skill',
  NorthNode: 'the direction your life is genuinely pulling you toward',
  'North Node': 'the direction your life is genuinely pulling you toward',
  SouthNode: 'the patterns and gifts you arrived with — already familiar, sometimes outgrown',
  'South Node': 'the patterns and gifts you arrived with — already familiar, sometimes outgrown',
  Ascendant: 'the way you show up in the world and the body that carries you through it',
  ASC: 'the way you show up in the world and the body that carries you through it',
  Midheaven: 'your public role, direction, and what the world is asking you to step into',
  MC: 'your public role, direction, and what the world is asking you to step into',
  IC: 'your private inner life, home, and roots',
  Descendant: 'the people you keep meeting and what they reflect back to you',
  DSC: 'the people you keep meeting and what they reflect back to you',
};

const THEME_MAPS: Record<TimingReadingType, Record<string, string>> = {
  relationship: NATAL_THEME_MAP,
  relocation: NATAL_THEME_MAP_RELOCATION,
  career: NATAL_THEME_MAP_CAREER,
  health: NATAL_THEME_MAP_HEALTH,
  money: NATAL_THEME_MAP_MONEY,
  spiritual: NATAL_THEME_MAP_SPIRITUAL,
  natal: NATAL_THEME_MAP_GENERAL,
  general: NATAL_THEME_MAP_GENERAL,
};

// Per-reading-type fallback that ALWAYS names the actual planet/point.
// Used when a planet/point is not in the theme map (so the user never sees
// generic "a major part of your personal pattern" copy).
const buildPlanetNamedFallback = (
  natalPlanet: string,
  readingType: TimingReadingType,
): string => {
  const lensByType: Record<TimingReadingType, string> = {
    relationship: 'as it expresses inside your relationship life',
    relocation: 'as it expresses through where you live and where you are headed',
    career: 'as it expresses in your career and professional identity',
    health: 'as it lives in your body and physical patterns',
    money: 'as it expresses in your financial life',
    spiritual: 'as it expresses in your inner and spiritual life',
    natal: 'as it lives at the core of who you are',
    general: 'as it expresses in your life right now',
  };
  const lens = lensByType[readingType] ?? lensByType.general;
  // Always names the natal planet/point explicitly — never a generic phrase.
  return `your natal ${natalPlanet} ${lens}`;
};

const getNatalThemeMap = (readingType: TimingReadingType): Record<string, string> => {
  return THEME_MAPS[readingType] ?? NATAL_THEME_MAP_GENERAL;
};

const getContextPhrase = (readingType: TimingReadingType): string => {
  const phrases: Record<TimingReadingType, string> = {
    relationship: 'In your relationship world,',
    relocation: "In terms of where you live and where you're headed,",
    career: 'In your career and public life,',
    health: 'In terms of your physical energy and wellbeing,',
    money: 'In your financial life,',
    spiritual: 'In your inner and spiritual life,',
    general: 'In your life overall,',
  };
  return phrases[readingType] ?? 'In your life,';
};

// ─────────────────────────────────────────────────────────────────────────────
// Transit action map (per reading type)
// ─────────────────────────────────────────────────────────────────────────────
const TRANSIT_ACTION_MAP: Record<TimingReadingType, Record<string, string>> = {
  relationship: {
    Jupiter: 'expands the relationship — more opportunity, more confidence, sometimes meeting someone new or going to the next level',
    Saturn: 'gets serious — something has to be defined, committed to, or honestly admitted; lukewarm dynamics get tested',
    Uranus: 'shakes the relationship loose — sudden attraction, sudden distance, or a sharp need for more space and freedom',
    Neptune: 'blurs the picture — fantasy, idealization, longing, or confusion about what the connection actually is',
    Pluto: 'turns the heat up underneath — power dynamics, intensity, jealousy, or a deep transformation in how you relate',
  },
  relocation: {
    Jupiter: 'opens the door — new places start to feel possible, invitations arrive, and the world gets bigger',
    Saturn: 'asks for commitment — where you actually want to put down roots and what you are willing to build',
    Uranus: 'shakes your environment loose — the urge to move, change scenery, or break a routine becomes hard to ignore',
    Neptune: 'softens your read on a place — what feels like home may be partly projection, so go slow',
    Pluto: 'transforms your relationship to place — old environments fall away and a deeper need to relocate surfaces',
  },
  career: {
    Jupiter: 'expands your professional world — visibility rises, opportunities appear, doors open',
    Saturn: 'tests your career structure — what you have built either solidifies or shows where it cannot hold',
    Uranus: 'disrupts your work pattern — sudden pivots, restructures, or an urge to change roles entirely',
    Neptune: 'blurs your professional clarity — direction softens, idealism rises, and you may not see the picture cleanly',
    Pluto: 'transforms your career power dynamics — what you do for work and who controls it is being reorganized at depth',
  },
  health: {
    Jupiter: 'amplifies your physical patterns — both the abundance and the excess become more visible',
    Saturn: 'puts structural pressure on the body — chronic patterns and physical limits demand honest attention',
    Uranus: 'brings sudden physical changes — energy spikes, sleep shifts, or unexpected symptoms surface',
    Neptune: 'softens your read on the body — symptoms may be diffuse and self-medication is a real risk',
    Pluto: 'transforms your relationship to the body — deep healing or deep depletion, depending on what is faced',
  },
  money: {
    Jupiter: 'expands your financial picture — income, opportunity, or expense all amplify',
    Saturn: 'tests your financial structure — debt, discipline, and long-term building come to the foreground',
    Uranus: 'disrupts your income pattern — sudden gains, sudden losses, or a complete shift in how you earn',
    Neptune: 'blurs your financial clarity — money decisions made now should be reviewed before being acted on',
    Pluto: 'transforms your financial power — control of money, debt, or shared resources shifts at depth',
  },
  spiritual: {
    Jupiter: 'expands your inner world — meaning, faith, and a sense of larger purpose grow',
    Saturn: 'tests your spiritual practice — what is real and what is performance becomes obvious',
    Uranus: 'disrupts your inner certainties — sudden insight or a need to break from old beliefs',
    Neptune: 'dissolves the boundary between self and source — porousness is high, discernment is hard',
    Pluto: 'transforms what you believe at the root — old frameworks die so something truer can emerge',
  },
  general: {
    Jupiter: 'expands this part of your life — more opportunity, more openness, more momentum',
    Saturn: 'asks for honest commitment — what is real solidifies, what is not falls away',
    Uranus: 'shakes loose the old pattern — sudden change, surprise, or a need for more freedom',
    Neptune: 'softens the picture — clarity is harder, idealism and confusion both rise',
    Pluto: 'transforms this area at depth — what you have outgrown is being reorganized',
  },
};

const getTransitAction = (readingType: TimingReadingType, transitPlanet: string): string => {
  return (
    TRANSIT_ACTION_MAP[readingType]?.[transitPlanet] ??
    TRANSIT_ACTION_MAP.general[transitPlanet] ??
    'activates'
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bug 1 — buildSpecificOpener now branches by readingType
// ─────────────────────────────────────────────────────────────────────────────
const RELATIONSHIP_OPENERS: Record<string, string> = {
  // Saturn
  'Saturn_conjunction_Sun': 'Saturn is sitting directly on your Sun right now — this is a year that asks you to get honest about who you actually are in relationships, not who you perform yourself to be',
  'Saturn_conjunction_Moon': 'Saturn conjuncting your Moon means emotional safety is being tested — situations will arise that ask whether you are choosing partners from genuine readiness or from fear of being alone',
  'Saturn_conjunction_Venus': 'Saturn on your Venus slows love down on purpose — this is not a window for casual, and anything that starts now will carry real weight',
  'Saturn_conjunction_Mars': 'Saturn conjuncting your Mars puts friction on desire — what you want and what you can actually have may not align yet, and the lesson is patience over force',
  'Saturn_square_Sun': 'Saturn squaring your Sun creates pressure around how you show up — in relationships, this often surfaces the gap between who you want to be seen as and who you actually are',
  'Saturn_square_Moon': 'Saturn squaring your Moon means your emotional self-protection is being tested directly — the question is whether the caution that has kept you safe is now the thing keeping you from what you want',
  'Saturn_square_Venus': 'Saturn squaring your Venus is a reality check on what you value — connections that lack real substance will feel that lack more acutely now',
  'Saturn_opposition_Moon': 'Saturn opposing your Moon brings a relationship reality check — something about how you have been handling emotional closeness is asking to be examined honestly',
  // Jupiter
  'Jupiter_conjunction_Sun': 'Jupiter on your Sun opens a window of confidence and visibility — in love, this is when you are most likely to attract someone who sees you clearly and responds to who you actually are',
  'Jupiter_conjunction_Moon': 'Jupiter conjuncting your Moon softens emotional guardedness — you may find it genuinely easier than usual to let someone in, and that openness is worth acting on',
  'Jupiter_conjunction_Venus': 'Jupiter on your Venus is the warmest romantic window of the year — chemistry feels louder, new people are more likely to arrive, and existing connections have room to deepen',
  'Jupiter_conjunction_Mars': 'Jupiter conjuncting your Mars amplifies desire and confidence — you are more likely to pursue what you want and more likely to get a genuine response',
  'Jupiter_trine_Sun': 'Jupiter trining your Sun creates a natural ease around how you present yourself — in relationships, you come across more openly and attract people who respond to your real self',
  'Jupiter_trine_Moon': 'Jupiter trining your Moon is a genuinely warm emotional window — connection feels less effortful than usual, and this is a good time to reach toward something you have been holding back from',
  'Jupiter_trine_Venus': 'Jupiter trining your Venus opens the most natural romantic window of this period — attraction is more available, social ease is higher, and new people are more likely to arrive through ordinary life',
  'Jupiter_trine_Mars': 'Jupiter trining your Mars gives desire real momentum — if you have been hesitating about something or someone, this window supports moving toward it',
  'Jupiter_sextile_Sun': 'Jupiter sextiling your Sun creates an opening for confidence in how you show up — say yes to invitations and introductions you would normally skip',
  'Jupiter_sextile_Moon': 'Jupiter sextiling your Moon offers a moment of emotional warmth and openness — a softer window to repair something, reach out, or let someone closer than usual',
  'Jupiter_sextile_Venus': 'Jupiter sextiling your Venus is the clearest opening for new connection in this window — the energy supports warmth, attraction, and social ease if you make a move',
  'Jupiter_sextile_Mars': 'Jupiter sextiling your Mars gives a helpful push to desire — if you have been uncertain about pursuing something, this is a window where the risk is lower and the momentum is real',
  'Jupiter_sextile_Mercury': 'Jupiter sextiling your Mercury opens social doors through conversation — new people are more likely to enter through unexpected introductions or exchanges',
  'Jupiter_square_Sun': 'Jupiter squaring your Sun creates pressure around identity and confidence — in love, this can feel like being pushed to show up more fully than feels comfortable',
  'Jupiter_square_Venus': 'Jupiter squaring your Venus amplifies attraction and optimism together — the risk is that chemistry outpaces compatibility, so let two weeks pass before deciding what something means',
  'Jupiter_square_Mars': 'Jupiter squaring your Mars makes desire loud and impatient — attraction can feel urgent and real, but the square asks you to check whether what you want is actually available',
  'Jupiter_square_Mercury': 'Jupiter squaring your Mercury opens unexpected doors through conversation and connection — say yes to introductions you would normally decline',
  // Neptune
  'Neptune_conjunction_Moon': 'Neptune on your Moon softens the boundary between what you feel and what is actually there — this is a period where emotional clarity is genuinely harder to find, and idealization is a real risk',
  'Neptune_conjunction_Venus': 'Neptune conjuncting your Venus is beautiful and blurring at the same time — connections that arrive now can feel fated or soulmate-level, but require careful reality-checking over time',
  'Neptune_opposition_Moon': 'Neptune opposing your Moon means your emotional read on relationships is softer and less reliable than usual — do not make permanent decisions at the peak of this transit',
  'Neptune_square_Moon': 'Neptune squaring your Moon means the clarity you normally rely on to assess people is running softer than usual — you may feel certain about someone before you actually know them well enough to be certain',
  'Neptune_square_Venus': 'Neptune squaring your Venus blurs what you want and who you are drawn to — this is a window for idealization, and what feels like the right person may need more time to reveal itself clearly',
  'Neptune_sextile_Mars': 'Neptune sextiling your Mars softens how desire works — you may feel drawn toward someone in a searching, intuitive way rather than with clear intention, which can be genuinely opening if you stay grounded',
  // Pluto
  'Pluto_conjunction_Moon': 'Pluto conjuncting your Moon is a slow and deep transformation of your emotional world — how you handle closeness, vulnerability, and what you need from a relationship is being fundamentally reorganized',
  'Pluto_conjunction_Venus': 'Pluto on your Venus intensifies everything about attraction and love — connections that arrive now are not casual, and this period can produce either deep transformation or obsessive dynamics depending on awareness',
  'Pluto_trine_Moon': 'Pluto trining your Moon is a quieter but powerful invitation to emotional depth — this window supports genuine intimacy, real vulnerability, and conversations that actually change something',
  'Pluto_trine_Venus': 'Pluto trining your Venus deepens what is possible in love — this is not a dramatic transit but a slow one, and the relationships that develop or deepen now have real staying power',
  'Pluto_trine_Mars': 'Pluto trining your Mars is gradually loosening old patterns around desire and pursuit — you may find yourself more willing to act on what you want, more direct than usual, and more aware of what you have been keeping private',
  'Pluto_square_Venus': 'Pluto squaring your Venus surfaces power dynamics in love — attractions now can feel consuming or transformative, and the work is staying conscious of the difference between depth and intensity',
  // Uranus
  'Uranus_conjunction_Venus': 'Uranus on your Venus is the most electrically charged transit for your love life in years — something changes faster than expected, a person arrives unexpectedly, or a need for freedom suddenly becomes impossible to ignore',
  'Uranus_conjunction_Mars': 'Uranus conjuncting your Mars shakes loose old patterns around desire and pursuit — sudden attraction, a sharp need for space, or a relationship dynamic that shifts without warning',
  'Uranus_opposition_Venus': 'Uranus opposing your Venus means something in your relationship world is shifting whether you are ready or not — resist forcing anything back to how it was',
  'Uranus_trine_Moon': 'Uranus trining your Moon brings welcome change to your emotional world — something new arrives through unexpected doors, and this is a window where saying yes to unfamiliar invitations actually leads somewhere',
  'Uranus_trine_Venus': 'Uranus trining your Venus opens surprising romantic possibilities — something arrives through an unexpected route, and the attraction that shows up now has a quality of genuine aliveness to it',
  'Uranus_square_Venus': 'Uranus squaring your Venus is disrupting what you thought you wanted in love — this can feel unsettling but it is also clarifying, showing you what you have outgrown',
};

const RELOCATION_OPENERS: Record<string, string> = {
  'Saturn_conjunction_Sun': 'Saturn sitting on your Sun this year is asking you to get honest about where you actually want to put down roots — not where seems logical, but where genuinely feels like yours',
  'Saturn_conjunction_Moon': 'Saturn conjuncting your Moon tests your sense of home directly — the place you have been calling home is being asked whether it actually holds you, or whether you have outgrown it',
  'Saturn_square_Moon': 'Saturn squaring your Moon puts pressure on your living situation — the gap between where you live and what you actually need to feel settled becomes hard to ignore',
  'Saturn_opposition_Moon': 'Saturn opposing your Moon brings a home-and-belonging reality check — a move, a redefinition of home, or an honest look at whether your environment is working',
  'Jupiter_trine_Venus': 'Jupiter trining your Venus opens a window where a new environment can feel genuinely welcoming — social ease is higher and new places are more likely to feel like they fit',
  'Jupiter_sextile_Venus': 'Jupiter sextiling your Venus opens up the world a little — places, scenes, and communities that felt out of reach become more available',
  'Jupiter_conjunction_Moon': 'Jupiter on your Moon expands your sense of home — the urge to move toward somewhere that feels nourishing is loud and worth listening to',
  'Jupiter_trine_Moon': 'Jupiter trining your Moon makes a new place easier to land in — emotional adjustment is smoother than usual and belonging arrives faster',
  'Neptune_conjunction_Moon': 'Neptune on your Moon dissolves your usual sense of where you belong — somewhere may pull on you strongly without yet revealing whether it is real fit or longing',
  'Neptune_square_Moon': 'Neptune squaring your Moon means your sense of what feels like home is softer and less reliable than usual — a place may feel right before you have enough information to know if it actually is',
  'Neptune_opposition_Moon': 'Neptune opposing your Moon means relocation decisions made at the peak should be revisited later — what looks like clarity now may be projection',
  'Pluto_trine_Mars': 'Pluto trining your Mars is gradually building your capacity to act on what you actually want — including making a move you have been postponing',
  'Pluto_conjunction_Moon': 'Pluto on your Moon is a deep reorganization of your relationship to home — where you live, who you live with, and what home means is being remade from the ground up',
  'Pluto_square_Moon': 'Pluto squaring your Moon surfaces what is no longer livable about your current environment — the pressure to move or change your home situation is real',
  'Uranus_conjunction_Mars': 'Uranus conjuncting your Mars means the urge to change your environment can become impossible to ignore — sudden decisions to move or explore are more likely now',
  'Uranus_conjunction_Moon': 'Uranus on your Moon shakes home loose — sudden changes to where or how you live, or a sharp need for a different environment',
  'Uranus_trine_Moon': 'Uranus trining your Moon opens unexpected doors to a new environment — a place you had not considered becomes suddenly possible',
  'Uranus_square_Moon': 'Uranus squaring your Moon disrupts your living situation — the pressure to change environments is high, even if the destination is not yet clear',
};

const CAREER_OPENERS: Record<string, string> = {
  'Saturn_conjunction_Sun': 'Saturn on your Sun is a defining career year — what you have been building either solidifies into something real or shows you where it cannot hold',
  'Saturn_conjunction_MC': 'Saturn on your Midheaven is a peak-of-career marker — public role, authority, and long-term direction crystallize into something that will define the next chapter',
  'Saturn_square_Sun': 'Saturn squaring your Sun creates professional pressure — the gap between the role you want and the role you have shows up in concrete ways',
  'Jupiter_conjunction_MC': 'Jupiter on your Midheaven is the strongest visibility transit of the cycle — promotions, public recognition, and bigger platforms are all more available now',
  'Jupiter_trine_Sun': 'Jupiter trining your Sun expands your professional confidence — you come across more clearly and people respond to that with opportunity',
  'Jupiter_sextile_Mercury': 'Jupiter sextiling your Mercury opens doors through conversation — pitches, interviews, and negotiations all land better than usual',
  'Jupiter_trine_Mars': 'Jupiter trining your Mars gives ambition real traction — if you have been waiting to make a move at work, this window backs you',
  'Pluto_trine_Sun': 'Pluto trining your Sun is gradually building your professional power — your authority and influence grow in a way that feels earned, not forced',
  'Pluto_conjunction_MC': 'Pluto on your Midheaven is a career transformation transit — what you do, who you work with, and your public role are being remade at depth',
  'Uranus_conjunction_MC': 'Uranus on your Midheaven shakes your career loose — sudden role changes, restructures, or an unexpected pivot in direction',
  'Neptune_square_Sun': 'Neptune squaring your Sun softens your professional clarity — direction may feel uncertain, and decisions made now should be reviewed in a few months',
};

const HEALTH_OPENERS: Record<string, string> = {
  'Saturn_conjunction_Sun': 'Saturn on your Sun is asking the body for an honest accounting — chronic patterns, energy limits, and structural health all come into focus',
  'Saturn_square_Sun': 'Saturn squaring your Sun brings physical pressure — the body may demand rest, structure, or treatment for something that has been ignored',
  'Saturn_conjunction_Moon': 'Saturn on your Moon puts emotional weight on the body — sleep, digestion, and stress responses all feel the load',
  'Jupiter_conjunction_Sun': 'Jupiter on your Sun amplifies vitality and excess at once — energy is higher but so is the risk of overdoing it',
  'Pluto_trine_Sun': 'Pluto trining your Sun supports deep healing — the body is more responsive to real change than usual',
  'Neptune_square_Moon': 'Neptune squaring your Moon means symptoms may be diffuse and self-medication is a real risk — be careful what you reach for to feel better',
  'Uranus_conjunction_Mars': 'Uranus conjuncting your Mars brings sudden physical changes — energy spikes, sleep disruption, or unexpected symptoms that need attention',
};

const MONEY_OPENERS: Record<string, string> = {
  'Jupiter_conjunction_Venus': 'Jupiter on your Venus is the strongest financial-opportunity window of the cycle — income, gifts, and unexpected gains are all more available',
  'Jupiter_trine_Venus': 'Jupiter trining your Venus opens financial doors — income opportunities, raises, or clients arrive more easily',
  'Jupiter_square_Venus': 'Jupiter squaring your Venus amplifies both income and spending — the risk is that expenses scale faster than earnings',
  'Saturn_conjunction_Venus': 'Saturn on your Venus tightens the financial picture — what you spend, save, and invest in needs honest review',
  'Saturn_square_Venus': 'Saturn squaring your Venus puts financial pressure on the table — debt, savings, or long-term commitments demand attention',
  'Pluto_conjunction_Venus': 'Pluto on your Venus transforms your relationship to money — earning, spending, and shared resources are reorganized at depth',
  'Pluto_square_Venus': 'Pluto squaring your Venus surfaces financial power dynamics — debt, inheritance, or shared money become unavoidable',
  'Uranus_conjunction_Venus': 'Uranus on your Venus disrupts your income pattern — sudden gains, sudden losses, or a complete shift in how you earn',
  'Neptune_square_Venus': 'Neptune squaring your Venus blurs your financial clarity — investment and spending decisions made now should be reviewed before being acted on',
};

const SPIRITUAL_OPENERS: Record<string, string> = {
  'Saturn_conjunction_Sun': 'Saturn on your Sun tests your spiritual practice — what is real and what is performance becomes obvious',
  'Jupiter_trine_Sun': 'Jupiter trining your Sun expands meaning and faith — your sense of larger purpose grows in a way that feels grounded',
  'Neptune_conjunction_Moon': 'Neptune on your Moon dissolves the boundary between self and source — porousness is high, dreams are vivid, and discernment matters',
  'Neptune_trine_Sun': 'Neptune trining your Sun softens defenses in a genuinely opening way — the felt sense of something larger than self becomes more available',
  'Pluto_conjunction_Sun': 'Pluto on your Sun is a soul-level identity transformation — what you believe at the root is being reorganized',
  'Pluto_trine_Moon': 'Pluto trining your Moon supports deep inner work — what surfaces from the depths can be integrated rather than dragging you under',
  'Uranus_trine_Sun': 'Uranus trining your Sun brings sudden insight — old beliefs loosen and something truer can come through',
};

const OPENERS_BY_TYPE: Record<TimingReadingType, Record<string, string>> = {
  relationship: RELATIONSHIP_OPENERS,
  relocation: RELOCATION_OPENERS,
  career: CAREER_OPENERS,
  health: HEALTH_OPENERS,
  money: MONEY_OPENERS,
  spiritual: SPIRITUAL_OPENERS,
  general: {},
};

const PLANET_FALLBACKS_BY_TYPE: Record<TimingReadingType, Record<string, Record<string, string>>> = {
  relationship: {
    Saturn: {
      conjunction: 'Saturn is sitting directly on your natal point — something has to be defined, committed to, or honestly faced',
      square: 'Saturn is squaring your natal point — a reality check is active, and lukewarm situations will feel the pressure',
      opposition: 'Saturn is opposing your natal point — a relationship reality check is asking you to see something clearly',
      trine: 'Saturn trining your natal point offers a chance to build something real — the structure is available if you do the work',
      sextile: 'Saturn sextiling your natal point creates a useful opening for commitment and clarity',
    },
    Jupiter: {
      conjunction: 'Jupiter is expanding this part of your chart directly — opportunity and openness are higher than usual',
      trine: 'Jupiter trining this part of your chart creates a natural opening — warmth and forward movement are available',
      sextile: 'Jupiter sextiling this part of your chart offers a helpful opening — things flow if you make a move',
      square: 'Jupiter squaring this part of your chart amplifies energy and appetite — the risk is overreaching or overcommitting',
      opposition: 'Jupiter opposing this part of your chart brings expansion through relationship — someone else may be the catalyst',
    },
    Neptune: {
      conjunction: 'Neptune is dissolving boundaries around this part of your chart — clarity is harder to find, and openness and idealization are both more available',
      square: 'Neptune squaring this part of your chart means your usual read on this area of life is softer than normal — go slowly',
      opposition: 'Neptune opposing this part of your chart blurs what feels certain — do not make permanent decisions at the peak',
      trine: 'Neptune trining this part of your chart softens defenses in a genuinely opening way — emotional porousness can be healing here',
      sextile: 'Neptune sextiling this part of your chart adds an intuitive, feeling-led quality to this area of life',
    },
    Pluto: {
      conjunction: 'Pluto is sitting on this part of your chart — a slow and deep transformation is underway that will not be rushed',
      trine: 'Pluto trining this part of your chart is a quiet but powerful invitation to go deeper — transformation is available without force',
      square: 'Pluto squaring this part of your chart brings intensity and power dynamics to the surface — awareness is the work',
      opposition: 'Pluto opposing this part of your chart surfaces what has been underneath — power dynamics and depth are unavoidable now',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real change',
    },
    Uranus: {
      conjunction: 'Uranus is sitting directly on this part of your chart — sudden shifts, unexpected arrivals, and the need for freedom are all active',
      trine: 'Uranus trining this part of your chart opens surprising possibilities — something new arrives through an unexpected route',
      square: 'Uranus squaring this part of your chart is disrupting the old pattern — what you thought you wanted may be shifting',
      opposition: 'Uranus opposing this part of your chart means change is coming through relationship — resist forcing the old shape back',
      sextile: "Uranus sextiling this part of your chart brings a helpful dose of the unexpected — be open to arrivals that don't fit the usual pattern",
    },
  },
  relocation: {
    Saturn: {
      conjunction: 'Saturn is asking where you actually want to put down roots — commitment to a place becomes the real question',
      square: 'Saturn is putting pressure on your living situation — the gap between where you live and what you need is hard to ignore',
      opposition: 'Saturn brings a relocation reality check — staying or moving is no longer a question you can postpone',
      trine: 'Saturn supports building something real in a new place — structure and commitment are available if you choose them',
      sextile: 'Saturn opens a useful window for committing to a place — small, concrete moves land',
    },
    Jupiter: {
      conjunction: 'Jupiter expands your sense of where you could live — the world feels bigger and more available',
      trine: 'Jupiter makes a new environment easier to land in — opportunities to relocate or explore arrive smoothly',
      sextile: 'Jupiter opens a small but real window for a move or a meaningful trip — say yes to invitations',
      square: 'Jupiter amplifies the urge to expand geographically — the risk is overreaching before checking the fit',
      opposition: 'Jupiter brings location-related opportunity through other people — a partner or contact may catalyze a move',
    },
    Neptune: {
      conjunction: 'Neptune dissolves your sense of where you belong — somewhere may pull on you strongly without yet revealing whether it is real fit',
      square: "Neptune means your sense of what feels like home is softer than usual — a place may feel right before you have enough information to know",
      opposition: 'Neptune blurs relocation clarity — decisions made at the peak should be revisited later',
      trine: 'Neptune adds a soft, intuitive pull toward a place — let it inform you, but verify with concrete details',
      sextile: 'Neptune adds a feeling-led quality to your sense of place — pay attention to what dreams and instincts surface',
    },
    Pluto: {
      conjunction: 'Pluto reorganizes your relationship to place — where you live and what home means is being remade from the ground up',
      trine: 'Pluto gradually builds your capacity to make a real move — change becomes possible without crisis',
      square: 'Pluto surfaces what is no longer livable about your current environment — the pressure to relocate is real',
      opposition: 'Pluto brings location pressure through other people — a relationship or external force forces the question',
      sextile: 'Pluto gives quiet momentum to a real environmental change',
    },
    Uranus: {
      conjunction: 'Uranus shakes your environment loose — sudden decisions to move or explore become hard to ignore',
      trine: 'Uranus opens unexpected doors to a new place — a destination you had not considered becomes possible',
      square: 'Uranus disrupts your living situation — pressure to change environments is high, even without a clear destination',
      opposition: 'Uranus brings location change through relationship or partnership — the move may not be solely yours',
      sextile: "Uranus brings a helpful dose of the unexpected to your sense of place — be open to arrivals that don't fit the usual pattern",
    },
  },
  career: {
    Saturn: {
      conjunction: 'Saturn on this part of your chart is a defining career marker — what you build either solidifies or shows where it cannot hold',
      square: 'Saturn squaring this part of your chart creates professional pressure — the gap between role wanted and role held becomes concrete',
      opposition: 'Saturn opposing this part of your chart brings a career reality check — definition or redirection is no longer optional',
      trine: 'Saturn trining this part of your chart supports building a real professional structure — discipline pays off',
      sextile: 'Saturn sextiling this part of your chart opens a small window for committing to a career direction',
    },
    Jupiter: {
      conjunction: 'Jupiter on this part of your chart expands your professional world — visibility, opportunity, and momentum all rise',
      trine: 'Jupiter trining this part of your chart smooths the path forward — opportunities arrive through ordinary work',
      sextile: 'Jupiter sextiling this part of your chart opens doors through conversation and outreach',
      square: 'Jupiter squaring this part of your chart amplifies ambition — the risk is overcommitting before checking sustainability',
      opposition: 'Jupiter opposing this part of your chart brings professional opportunity through partnership or mentorship',
    },
    Neptune: {
      conjunction: 'Neptune on this part of your chart blurs professional clarity — direction softens and decisions need a second look',
      square: 'Neptune squaring this part of your chart makes professional read less reliable — go slowly on big career decisions',
      opposition: 'Neptune opposing this part of your chart introduces fog through other people — be careful what you sign onto',
      trine: 'Neptune trining this part of your chart adds vision and intuition to your work — useful if grounded by structure',
      sextile: 'Neptune sextiling this part of your chart opens an intuitive, feeling-led quality to career choices',
    },
    Pluto: {
      conjunction: 'Pluto on this part of your chart transforms your career power dynamics — what you do and who controls it is reorganized at depth',
      trine: 'Pluto trining this part of your chart steadily builds your professional power — authority grows in a way that feels earned',
      square: 'Pluto squaring this part of your chart surfaces career power dynamics — control, authority, and politics become unavoidable',
      opposition: 'Pluto opposing this part of your chart brings career intensity through relationship — partners, bosses, or rivals catalyze change',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real professional change',
    },
    Uranus: {
      conjunction: 'Uranus on this part of your chart shakes your career loose — sudden role changes or pivots are more likely',
      trine: 'Uranus trining this part of your chart opens surprising professional doors — say yes to unconventional offers',
      square: 'Uranus squaring this part of your chart disrupts your work pattern — restructure may be coming whether you choose it or not',
      opposition: 'Uranus opposing this part of your chart brings career change through other people — partners, colleagues, or industry shifts',
      sextile: 'Uranus sextiling this part of your chart adds welcome novelty to your work — be open to unexpected offers',
    },
  },
  health: {
    Saturn: {
      conjunction: 'Saturn on this part of your chart asks the body for honest accounting — chronic patterns and structural health come into focus',
      square: 'Saturn squaring this part of your chart brings physical pressure — the body may demand rest or treatment',
      opposition: 'Saturn opposing this part of your chart surfaces health limits — slow down or address what is being ignored',
      trine: 'Saturn trining this part of your chart supports building real physical structure — exercise, sleep, and routine pay off',
      sextile: 'Saturn sextiling this part of your chart opens a window for committing to a health practice that lasts',
    },
    Jupiter: {
      conjunction: 'Jupiter on this part of your chart amplifies physical patterns — both vitality and excess become more visible',
      trine: 'Jupiter trining this part of your chart supports physical recovery and growth — the body responds well',
      sextile: 'Jupiter sextiling this part of your chart opens a window for adding something nourishing to your routine',
      square: 'Jupiter squaring this part of your chart amplifies excess — overeating, overtraining, or overdoing it is the risk',
      opposition: 'Jupiter opposing this part of your chart brings health expansion through other people — community, support, or shared practice',
    },
    Neptune: {
      conjunction: 'Neptune on this part of your chart softens your read on the body — symptoms may be diffuse and self-medication is a risk',
      square: 'Neptune squaring this part of your chart makes the body harder to read — get a second opinion before acting on a self-diagnosis',
      opposition: 'Neptune opposing this part of your chart introduces health confusion through others — be careful what advice you absorb',
      trine: 'Neptune trining this part of your chart supports gentle healing modalities — rest, water, and softness all land',
      sextile: 'Neptune sextiling this part of your chart adds an intuitive read to physical needs — listen to it',
    },
    Pluto: {
      conjunction: 'Pluto on this part of your chart transforms your relationship to the body — deep healing or deep depletion, depending on what is faced',
      trine: 'Pluto trining this part of your chart supports real healing — the body is more responsive to deep change than usual',
      square: 'Pluto squaring this part of your chart surfaces what has been suppressed in the body — old patterns demand attention',
      opposition: 'Pluto opposing this part of your chart brings physical intensity through relationship or environment',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real physical change',
    },
    Uranus: {
      conjunction: 'Uranus on this part of your chart brings sudden physical changes — energy spikes, sleep shifts, or unexpected symptoms',
      trine: 'Uranus trining this part of your chart opens unexpected physical breakthroughs — try a new modality',
      square: 'Uranus squaring this part of your chart disrupts physical routine — sleep, energy, and rhythm all destabilize',
      opposition: 'Uranus opposing this part of your chart brings health surprises through other people or environments',
      sextile: 'Uranus sextiling this part of your chart adds welcome novelty to your physical routine',
    },
  },
  money: {
    Saturn: {
      conjunction: 'Saturn on this part of your chart tightens the financial picture — what you spend, save, and owe needs honest review',
      square: 'Saturn squaring this part of your chart brings financial pressure — debt, savings, or long-term commitments demand attention',
      opposition: 'Saturn opposing this part of your chart surfaces financial reality through other people — partners, creditors, or contracts',
      trine: 'Saturn trining this part of your chart supports building real financial structure — discipline pays off',
      sextile: 'Saturn sextiling this part of your chart opens a small window for committing to a financial plan',
    },
    Jupiter: {
      conjunction: 'Jupiter on this part of your chart expands your financial picture — income, opportunity, or expense all amplify',
      trine: 'Jupiter trining this part of your chart smooths the path to income — opportunities arrive through ordinary work',
      sextile: 'Jupiter sextiling this part of your chart opens financial doors through conversation and outreach',
      square: 'Jupiter squaring this part of your chart amplifies both income and spending — the risk is expenses scaling faster than earnings',
      opposition: 'Jupiter opposing this part of your chart brings financial opportunity through partnership',
    },
    Neptune: {
      conjunction: 'Neptune on this part of your chart blurs your financial clarity — review investment and spending decisions before acting',
      square: 'Neptune squaring this part of your chart makes financial read less reliable — go slowly on commitments',
      opposition: 'Neptune opposing this part of your chart introduces financial fog through other people — read fine print twice',
      trine: 'Neptune trining this part of your chart supports values-aligned earning — what you do for love can also pay',
      sextile: 'Neptune sextiling this part of your chart adds an intuitive read on money flow',
    },
    Pluto: {
      conjunction: 'Pluto on this part of your chart transforms your relationship to money — earning, spending, and shared resources reorganize at depth',
      trine: 'Pluto trining this part of your chart steadily builds financial power — authority over your resources grows',
      square: 'Pluto squaring this part of your chart surfaces financial power dynamics — debt, inheritance, or shared money become unavoidable',
      opposition: 'Pluto opposing this part of your chart brings financial intensity through relationship — partners or external forces catalyze change',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real financial change',
    },
    Uranus: {
      conjunction: 'Uranus on this part of your chart disrupts your income pattern — sudden gains, sudden losses, or a complete shift',
      trine: 'Uranus trining this part of your chart opens surprising financial doors — unconventional income is more available',
      square: 'Uranus squaring this part of your chart destabilizes income — be ready to adapt quickly',
      opposition: 'Uranus opposing this part of your chart brings financial change through others — joint accounts or partnerships shift',
      sextile: 'Uranus sextiling this part of your chart adds welcome novelty to how you earn',
    },
  },
  spiritual: {
    Saturn: {
      conjunction: 'Saturn on this part of your chart tests your spiritual practice — what is real and what is performance becomes obvious',
      square: 'Saturn squaring this part of your chart brings spiritual pressure — discipline and honesty are required',
      opposition: 'Saturn opposing this part of your chart surfaces spiritual reality through other people — teachers, communities, or absences',
      trine: 'Saturn trining this part of your chart supports building a real spiritual practice — consistency pays off',
      sextile: 'Saturn sextiling this part of your chart opens a window for committing to a practice that lasts',
    },
    Jupiter: {
      conjunction: 'Jupiter on this part of your chart expands your inner world — meaning, faith, and a sense of larger purpose grow',
      trine: 'Jupiter trining this part of your chart smooths spiritual opening — insight arrives through ordinary life',
      sextile: 'Jupiter sextiling this part of your chart opens doors to spiritual community or teaching',
      square: 'Jupiter squaring this part of your chart amplifies belief — the risk is spiritual overconfidence or dogma',
      opposition: 'Jupiter opposing this part of your chart brings spiritual opening through other people',
    },
    Neptune: {
      conjunction: 'Neptune on this part of your chart dissolves the boundary between self and source — porousness is high, discernment matters',
      square: 'Neptune squaring this part of your chart blurs spiritual clarity — be careful what you call a sign',
      opposition: 'Neptune opposing this part of your chart introduces spiritual confusion through others — verify what teachers tell you',
      trine: 'Neptune trining this part of your chart softens defenses in a genuinely opening way — felt sense of the larger field',
      sextile: 'Neptune sextiling this part of your chart adds intuition and receptivity to your inner life',
    },
    Pluto: {
      conjunction: 'Pluto on this part of your chart transforms what you believe at the root — old frameworks die so something truer can emerge',
      trine: 'Pluto trining this part of your chart supports deep inner work — what surfaces can be integrated',
      square: 'Pluto squaring this part of your chart surfaces what has been spiritually bypassed — honest reckoning is the work',
      opposition: 'Pluto opposing this part of your chart brings spiritual intensity through relationship — others mirror what you have not faced',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real inner change',
    },
    Uranus: {
      conjunction: 'Uranus on this part of your chart shakes your spiritual certainties — sudden insight or a need to break from old beliefs',
      trine: 'Uranus trining this part of your chart brings sudden insight — old beliefs loosen, something truer comes through',
      square: 'Uranus squaring this part of your chart disrupts your spiritual frame — what you thought you knew is no longer enough',
      opposition: 'Uranus opposing this part of your chart brings spiritual breakthrough through other people or unexpected encounters',
      sextile: 'Uranus sextiling this part of your chart adds welcome novelty to your inner life',
    },
  },
  general: {
    Saturn: {
      conjunction: 'Saturn is sitting on this part of your chart — something needs to be defined, committed to, or honestly faced',
      square: 'Saturn is squaring this part of your chart — a reality check is active',
      opposition: 'Saturn is opposing this part of your chart — definition or redirection is no longer optional',
      trine: 'Saturn trining this part of your chart supports building something real — discipline pays off',
      sextile: 'Saturn sextiling this part of your chart opens a useful window for commitment',
    },
    Jupiter: {
      conjunction: 'Jupiter is expanding this part of your chart — opportunity and openness are higher than usual',
      trine: 'Jupiter trining this part of your chart creates a natural opening — forward movement is available',
      sextile: 'Jupiter sextiling this part of your chart offers a helpful opening — say yes',
      square: 'Jupiter squaring this part of your chart amplifies energy — the risk is overreaching',
      opposition: 'Jupiter opposing this part of your chart brings expansion through other people',
    },
    Neptune: {
      conjunction: 'Neptune is dissolving boundaries around this part of your chart — clarity is harder, openness is higher',
      square: 'Neptune squaring this part of your chart softens your usual read — go slowly',
      opposition: 'Neptune opposing this part of your chart blurs what feels certain — postpone permanent decisions',
      trine: 'Neptune trining this part of your chart softens defenses in a genuinely opening way',
      sextile: 'Neptune sextiling this part of your chart adds an intuitive quality',
    },
    Pluto: {
      conjunction: 'Pluto is sitting on this part of your chart — slow, deep transformation is underway',
      trine: 'Pluto trining this part of your chart is a quiet but powerful invitation to go deeper',
      square: 'Pluto squaring this part of your chart brings intensity to the surface',
      opposition: 'Pluto opposing this part of your chart surfaces what has been underneath',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real change',
    },
    Uranus: {
      conjunction: 'Uranus is sitting on this part of your chart — sudden shifts and the need for freedom are active',
      trine: 'Uranus trining this part of your chart opens surprising possibilities',
      square: 'Uranus squaring this part of your chart disrupts the old pattern',
      opposition: 'Uranus opposing this part of your chart brings change through other people',
      sextile: 'Uranus sextiling this part of your chart brings a helpful dose of the unexpected',
    },
  },
};

const buildSpecificOpener = (
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  readingType: TimingReadingType,
): string => {
  const key = `${transitPlanet}_${aspect}_${natalPlanet}`;
  const typeOpeners = OPENERS_BY_TYPE[readingType] ?? {};
  if (typeOpeners[key]) return typeOpeners[key];

  // Fall back to relationship openers ONLY for relationship readings; never bleed relationship language into others.
  if (readingType === 'relationship' && RELATIONSHIP_OPENERS[key]) {
    return RELATIONSHIP_OPENERS[key];
  }

  const fallbackForType = PLANET_FALLBACKS_BY_TYPE[readingType] ?? PLANET_FALLBACKS_BY_TYPE.general;
  if (fallbackForType[transitPlanet]?.[aspect]) {
    return fallbackForType[transitPlanet][aspect];
  }

  const generalFallback = PLANET_FALLBACKS_BY_TYPE.general[transitPlanet]?.[aspect];
  if (generalFallback) return generalFallback;

  return `${transitPlanet} is activating this part of your chart`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5 — tag taxonomy per reading type, Title-Case, with safe defaults
// ─────────────────────────────────────────────────────────────────────────────
export type TimingTag = string; // free-form Title-Case label per reading type

const SUPPORTIVE_ASPECTS = new Set(['conjunction', 'sextile', 'trine']);

const classifyTimingTag = (
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  readingType: TimingReadingType,
): TimingTag => {
  const supportive = SUPPORTIVE_ASPECTS.has(aspect);

  switch (readingType) {
    case 'relocation':
      if (transitPlanet === 'Jupiter') return supportive ? 'Expansion' : 'Caution';
      if (transitPlanet === 'Saturn') return supportive ? 'Settle-In' : 'Caution';
      if (transitPlanet === 'Uranus') return supportive ? 'Exploration' : 'Move-Window';
      if (transitPlanet === 'Neptune') return supportive ? 'Clarity' : 'Caution';
      if (transitPlanet === 'Pluto') return supportive ? 'Move-Window' : 'Caution';
      return 'Clarity';

    case 'career':
      if (transitPlanet === 'Jupiter') return supportive ? 'Opportunity' : 'Caution';
      if (transitPlanet === 'Saturn') return supportive ? 'Advancement' : 'Pressure';
      if (transitPlanet === 'Uranus') return supportive ? 'Opportunity' : 'Turning-Point';
      if (transitPlanet === 'Neptune') return supportive ? 'Visibility' : 'Caution';
      if (transitPlanet === 'Pluto') return supportive ? 'Turning-Point' : 'Pressure';
      return 'Visibility';

    case 'health':
      if (transitPlanet === 'Jupiter') return supportive ? 'Vitality' : 'Caution';
      if (transitPlanet === 'Saturn') return supportive ? 'Restoration' : 'Pressure';
      if (transitPlanet === 'Uranus') return supportive ? 'Vitality' : 'Turning-Point';
      if (transitPlanet === 'Neptune') return supportive ? 'Restoration' : 'Caution';
      if (transitPlanet === 'Pluto') return supportive ? 'Restoration' : 'Turning-Point';
      return 'Vitality';

    case 'money':
      if (transitPlanet === 'Jupiter') return supportive ? 'Opportunity' : 'Expansion';
      if (transitPlanet === 'Saturn') return supportive ? 'Expansion' : 'Pressure';
      if (transitPlanet === 'Uranus') return supportive ? 'Opportunity' : 'Turning-Point';
      if (transitPlanet === 'Neptune') return supportive ? 'Opportunity' : 'Caution';
      if (transitPlanet === 'Pluto') return supportive ? 'Turning-Point' : 'Pressure';
      return 'Opportunity';

    case 'spiritual':
      if (transitPlanet === 'Jupiter') return supportive ? 'Opening' : 'Reflection';
      if (transitPlanet === 'Saturn') return supportive ? 'Practice' : 'Reflection';
      if (transitPlanet === 'Uranus') return supportive ? 'Insight' : 'Reflection';
      if (transitPlanet === 'Neptune') return supportive ? 'Opening' : 'Reflection';
      if (transitPlanet === 'Pluto') return supportive ? 'Transformation' : 'Reflection';
      return 'Practice';

    case 'general':
      if (transitPlanet === 'Jupiter') return supportive ? 'Opportunity' : 'Caution';
      if (transitPlanet === 'Saturn') return supportive ? 'Commitment' : 'Pressure';
      if (transitPlanet === 'Uranus') return supportive ? 'Change' : 'Disruption';
      if (transitPlanet === 'Neptune') return supportive ? 'Clarity' : 'Caution';
      if (transitPlanet === 'Pluto') return supportive ? 'Transformation' : 'Pressure';
      return 'Turning-Point';

    case 'relationship':
    default:
      if (transitPlanet === 'Jupiter') {
        if (['Venus', 'Mars'].includes(natalPlanet)) return 'Attraction';
        if (natalPlanet === 'Moon') return 'Healing';
        return 'Meeting';
      }
      if (transitPlanet === 'Saturn') return supportive ? 'Commitment' : 'Test';
      if (transitPlanet === 'Uranus') return supportive ? 'Meeting' : 'Rupture';
      if (transitPlanet === 'Neptune') return supportive ? 'Healing' : 'Test';
      if (transitPlanet === 'Pluto') return supportive ? 'Healing' : 'Test';
      return 'Test';
  }
};

const TAG_ACTION_MAP: Record<string, { label: string; watch: string }> = {
  // Relationship
  Meeting: { label: 'Meeting energy', watch: 'Say yes to invitations, introductions, and one-off events you would normally skip — this is when new people enter through unexpected doors.' },
  Attraction: { label: 'Attraction spike', watch: 'Chemistry feels louder than usual. Notice who you keep thinking about, but wait two weeks before deciding if it is real connection or just heat.' },
  Commitment: { label: 'Define-the-relationship', watch: 'This is the window for the honest conversation — what are we, where is this going, what do I actually need? Lukewarm answers are an answer.' },
  Test: { label: 'Pressure test', watch: 'Old patterns and unspoken doubts surface. Do not make permanent decisions in the heat of it — let it show you what is actually true, then act.' },
  Rupture: { label: 'Sudden shift', watch: 'Something changes faster than you expected — a person leaves, a feeling flips, a need for space gets loud. Resist the urge to force it back.' },
  Healing: { label: 'Repair window', watch: 'A softer opening to repair, forgive, or be vulnerable. Reach out to the person you have been avoiding the conversation with.' },
  // Relocation
  'Move-Window': { label: 'Move window', watch: 'A real opening to make a geographic move. Concrete steps land — listings, leases, logistics.' },
  'Settle-In': { label: 'Settle in', watch: 'A window for committing to a place, signing a lease, or building roots where you already are.' },
  Exploration: { label: 'Exploration', watch: 'Travel, scouting trips, and short stays land well — gather information before bigger decisions.' },
  Caution: { label: 'Caution window', watch: 'Postpone irreversible decisions. Use this window to gather information, not to commit.' },
  Clarity: { label: 'Clarity window', watch: 'A clearer read on what you actually want. Use it to make a decision you have been postponing.' },
  Expansion: { label: 'Expansion window', watch: 'The world feels bigger and more available. Say yes to opportunities that grow your range.' },
  // Career
  Opportunity: { label: 'Opportunity window', watch: 'Doors open. Apply, pitch, ask — the answers are more likely to be yes than usual.' },
  Pressure: { label: 'Pressure window', watch: 'Demands and limits surface. Address what is being asked before it escalates.' },
  Visibility: { label: 'Visibility window', watch: 'You are being seen more than usual — make sure what is visible is what you want seen.' },
  Advancement: { label: 'Advancement window', watch: 'A real window for promotion, recognition, or stepping into more authority.' },
  'Turning-Point': { label: 'Turning point', watch: 'A pivot moment. The choice you make here sets direction for the next phase.' },
  // Health
  Vitality: { label: 'Vitality window', watch: 'Energy is more available — invest it in physical practice that compounds.' },
  Restoration: { label: 'Restoration window', watch: 'Rest, repair, and slow down. The body responds well to gentleness now.' },
  // Spiritual / general extras
  Opening: { label: 'Opening', watch: 'Receptivity is high. Let in what wants to come through.' },
  Practice: { label: 'Practice window', watch: 'A good time to commit to a real, sustainable inner practice.' },
  Insight: { label: 'Insight window', watch: 'Sudden clarity. Write it down before it dissolves.' },
  Reflection: { label: 'Reflection window', watch: 'Slow down, review, and verify before acting on inner certainty.' },
  Transformation: { label: 'Transformation', watch: 'Deep change is underway. Cooperate with what is dying so what is emerging can take shape.' },
  Change: { label: 'Change window', watch: 'Something shifts. Stay flexible.' },
  Disruption: { label: 'Disruption', watch: 'Routine breaks. Resist forcing the old shape back.' },
};

export interface DeterministicTimingTransit {
  planet: string;
  symbol: string;
  position: string;
  aspect: string;
  exact_degree: string;
  natal_point: string;
  first_applying_date: string;
  exact_hit_date: string;
  separating_end_date: string;
  pass_label: string;
  date_range: string;
  tag: string;
  interpretation: string;
}

export interface DeterministicTimingWindow {
  label: string;
  description: string;
}

export interface DeterministicTimingSection {
  type: 'timing_section';
  title: string;
  transits: DeterministicTimingTransit[];
  windows: DeterministicTimingWindow[];
}

interface FutureTimingData {
  context: string;
  section: DeterministicTimingSection | null;
}

const clampDegreeParts = (lon: number) => {
  const normalized = normalizeLongitude(lon);
  let signIdx = Math.floor(normalized / 30);
  const signStart = signIdx * 30;
  const degreeWithFraction = normalized - signStart;
  let wholeDegrees = Math.floor(degreeWithFraction);
  let minutes = Math.round((degreeWithFraction - wholeDegrees) * 60);

  if (minutes === 60) {
    wholeDegrees += 1;
    minutes = 0;
  }

  if (wholeDegrees === 30) {
    wholeDegrees = 0;
    signIdx = (signIdx + 1) % 12;
  }

  return {
    sign: ZODIAC[signIdx],
    wholeDegrees,
    minutes,
  };
};

const longitudeToSignDegree = (lon: number): string => {
  const { sign, wholeDegrees, minutes } = clampDegreeParts(lon);
  return `${wholeDegrees}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

const buildNatalPositions = (chart: NatalChart | null): { name: string; longitude: number }[] => {
  if (!chart?.planets) return [];

  return Object.entries(chart.planets).flatMap(([name, data]) => {
    if (!data || typeof data !== 'object' || !('sign' in data)) return [];
    const sign = (data as { sign: string }).sign;
    const signIdx = ZODIAC.indexOf(sign);
    if (signIdx < 0) return [];

    const degree = typeof (data as { degree?: number }).degree === 'number' ? (data as { degree: number }).degree : 0;
    const minutes = typeof (data as { minutes?: number }).minutes === 'number' ? (data as { minutes: number }).minutes : 0;

    return [{ name, longitude: signIdx * 30 + degree + minutes / 60 }];
  });
};

const isRetrogradeAtExactHit = (planet: string, exactDate: Date, passLabel: string): boolean => {
  if (/retrograde/i.test(passLabel)) return true;

  const body = TRANSIT_BODIES[planet];
  if (!body) return false;

  const before = getPlanetLongitudeExact(body, new Date(exactDate.getTime() - 12 * 60 * 60 * 1000));
  const after = getPlanetLongitudeExact(body, new Date(exactDate.getTime() + 12 * 60 * 60 * 1000));
  return normalizeLongitude(after - before + 360) > 180;
};

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3 — Developmental milestone overrides
// Some transits are not "just transits" — they are once-or-twice-in-a-lifetime
// developmental thresholds. When transit X aspects natal X (the same body), we
// are looking at a generational cycle hitting an individual: Uranus opp Uranus
// at ~40 (mid-life), Uranus square Uranus at ~21 (early-adult identity quake)
// and ~63, Saturn return at ~29/~58, Jupiter return every ~12 yrs, Chiron
// return at ~50, Nodal return at ~18.6 / ~37 / ~56. These must be named for
// what they actually are — generic "urge to change environment" copy is wrong.
// ─────────────────────────────────────────────────────────────────────────────
const getDevelopmentalMilestoneInterpretation = (
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  readingType: TimingReadingType,
  passSummary: string,
  isRetrograde: boolean,
): string | null => {
  const retroLine = isRetrograde
    ? ' Because the transit is retrograde on at least one pass, the theme revisits in waves rather than landing all at once.'
    : '';

  // Helper to assemble final paragraph using the chosen developmental opener
  // followed by a reading-type lens line and the timing summary.
  const wrap = (developmentalOpener: string, lensLine: string): string =>
    `${developmentalOpener} ${lensLine} ${passSummary}${retroLine}`;

  // ── Uranus → natal Uranus ────────────────────────────────────────────────
  // The Uranus generational cycle: square (~21), opposition (~40), square (~63),
  // return (~84). These are the most well-known developmental quakes in the chart.
  if (transitPlanet === 'Uranus' && natalPlanet === 'Uranus') {
    if (aspect === 'square') {
      const opener =
        'This is a Uranus square Uranus — one of the defining developmental transits of early adulthood (it lands around age 21 and again around age 63). It is not a generic "change of scenery" — it is the moment your inherited identity stops fitting and an unmistakable, more authentic version of you tries to break through. Generic restlessness is the surface; the real event is the rejection of a life that was someone else\'s plan.';
      const lens: Record<TimingReadingType, string> = {
        relationship: 'In love, this surfaces as either suddenly outgrowing a partner you committed to too early, or finally meeting someone who actually fits the version of you that is emerging. Old loyalties fall away.',
        relocation: 'A move at this age is rarely just a move — it is the body looking for an environment that matches who you are becoming, not who you were when you left home.',
        career: 'Whatever path was chosen by parents, school, or default starts to crack. The job, major, or career track you adopted before you knew yourself is being honestly questioned for the first time.',
        health: 'The nervous system runs hot — sleep, energy and focus may all destabilize as the body refuses the old container.',
        money: 'Financial habits set up by a younger version of you stop working — earning, spending and saving all need a more honest, more autonomous structure.',
        spiritual: 'Inherited beliefs are tested directly. What you were taught is no longer enough; first-hand experience is the only currency now.',
        general: 'The whole self-concept is reorganizing. The ground tilts on purpose so a more honest life can take shape.',
      };
      return wrap(opener, lens[readingType] ?? lens.general);
    }
    if (aspect === 'opposition') {
      const opener =
        'This is the Uranus opposition — the classical mid-life crisis transit (around age 40). It is not a marketing cliché; it is the chart asking, point-blank, whether the life you have built is actually yours. Restlessness, sudden urges to leave, attraction to younger or freer people, and an itch to throw it all out are all expressions of one underlying question.';
      const lens: Record<TimingReadingType, string> = {
        relationship: 'Long-term relationships either deepen into something more real or are honestly examined. Affairs, sudden departures, and new attractions at this age are rarely about the other person — they are about a self trying to be felt again.',
        relocation: 'Moving now can be liberating or escapist. The question is whether the new place lets you live more honestly or just lets you avoid yourself somewhere prettier.',
        career: 'The career you built in your 20s and 30s is being audited. What was achievement may now feel like a cage; what felt unrealistic may now feel non-negotiable.',
        health: 'The body insists on being heard — sleep, blood pressure, and stress symptoms become the cost of any life that is not actually yours.',
        money: 'Money is being asked to serve a more honest life, not maintain an old image.',
        spiritual: 'Meaning becomes a survival question. Spiritual bypass stops working; only first-hand depth holds now.',
        general: 'The mid-life threshold. The point of the transit is not what you do — it is whether you tell yourself the truth about what you actually want.',
      };
      return wrap(opener, lens[readingType] ?? lens.general);
    }
    if (aspect === 'conjunction') {
      const opener =
        'This is the Uranus return — a once-in-a-lifetime threshold around age 84. The full Uranus cycle is complete: a moment of genuine elder vantage, when the soul looks back at the whole arc.';
      return wrap(opener, 'Whatever the lens, the work here is integration and transmission — not new ambition.');
    }
  }

  // ── Saturn return ────────────────────────────────────────────────────────
  if (transitPlanet === 'Saturn' && natalPlanet === 'Saturn' && aspect === 'conjunction') {
    const opener =
      'This is a Saturn return — the classic ~29-year (and again ~58-year) coming-of-age transit. Anything built on a shaky or borrowed foundation gets stress-tested; anything genuinely yours gets locked into structure. It is rarely comfortable, and it is almost always clarifying.';
    const lens: Record<TimingReadingType, string> = {
      relationship: 'Relationships either deepen into adult commitment or end honestly. Lukewarm versions of love do not survive this transit.',
      relocation: 'Where you live becomes a real question — not a fantasy. The Saturn return often coincides with finally settling somewhere on purpose, or finally leaving a place you have only been tolerating.',
      career: 'Career structures crystallize. What you have actually built shows what it can hold; what was performance falls away.',
      health: 'The body asks for sustainable rhythms. Habits that worked in your 20s often stop working here.',
      money: 'Adult financial structure becomes non-negotiable — debt, savings, and long-term commitments come into focus.',
      spiritual: 'Practice over performance. Whatever spiritual life you actually live (not the one you talk about) is what holds.',
      general: 'The threshold into adult selfhood. What gets built here tends to last.',
    };
    return wrap(opener, lens[readingType] ?? lens.general);
  }

  // ── Saturn opposite Saturn / Saturn square Saturn ────────────────────────
  if (transitPlanet === 'Saturn' && natalPlanet === 'Saturn' && (aspect === 'opposition' || aspect === 'square')) {
    const opener =
      `This is a Saturn ${aspect} natal Saturn — a ${aspect === 'opposition' ? 'mid-cycle (~14/~44 yrs)' : 'quarter-cycle (~7/~21/~36/~50 yrs)'} structural review. Whatever you have been building either holds under pressure or shows where it cannot. This is structural honesty, not punishment.`;
    return wrap(opener, 'The work is to face what is real and adjust the structure accordingly.');
  }

  // ── Jupiter return ───────────────────────────────────────────────────────
  if (transitPlanet === 'Jupiter' && natalPlanet === 'Jupiter' && aspect === 'conjunction') {
    const opener =
      'This is a Jupiter return — the ~12-year renewal of how you grow, what you believe, and where you take risks. Often a fresh chapter begins here: a new vision of what is possible opens, and old contractions loosen.';
    return wrap(opener, 'The window favors planting seeds whose harvest will come over the next 12 years.');
  }

  // ── Chiron return ────────────────────────────────────────────────────────
  if (transitPlanet === 'Chiron' && natalPlanet === 'Chiron' && aspect === 'conjunction') {
    const opener =
      'This is the Chiron return — a once-in-a-lifetime transit around age ~50. The original wound surfaces in a final way, and the work is to meet it as the elder, not the patient. What you have learned to hold in yourself becomes what you can offer others.';
    return wrap(opener, 'It is a threshold from personal healing into authentic teaching.');
  }

  // ── Nodal return / opposition ────────────────────────────────────────────
  // Transiting Nodes return to natal Node position every ~18.6 years.
  if (
    (transitPlanet === 'NorthNode' || transitPlanet === 'North Node') &&
    (natalPlanet === 'NorthNode' || natalPlanet === 'North Node') &&
    aspect === 'conjunction'
  ) {
    const opener =
      'This is a Nodal return — every ~18.6 years the transiting North Node lands on its natal place. It marks a recommitment to the direction your life is genuinely growing toward. Old patterns surface so you can choose them again or choose differently, this time on purpose.';
    return wrap(opener, 'It is a doorway moment for the larger life direction.');
  }

  return null; // No developmental override → fall back to standard transit copy.
};

// ─────────────────────────────────────────────────────────────────────────────
// Interpretation builders (now reading-type aware)
// ─────────────────────────────────────────────────────────────────────────────
const buildTransitInterpretation = (params: {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalDegree: string;
  passSummary: string; // pre-built pass description (handles single vs multi-pass)
  isRetrograde: boolean;
  readingType: TimingReadingType;
}): string => {
  const {
    transitPlanet,
    aspect,
    natalPlanet,
    passSummary,
    isRetrograde,
    readingType,
  } = params;

  // Bug 3 — developmental milestone interpretations override generic transit copy.
  // (Uranus opp Uranus = age ~40, Uranus square Uranus = age ~21 / ~63, Saturn return,
  // Jupiter return, Chiron return, Nodal return, etc.) Returned text is final.
  const developmentalOverride = getDevelopmentalMilestoneInterpretation(
    transitPlanet,
    aspect,
    natalPlanet,
    readingType,
    passSummary,
    isRetrograde,
  );
  if (developmentalOverride) return developmentalOverride;

  const aspectTone = buildSpecificOpener(transitPlanet, aspect, natalPlanet, readingType);
  const transitAction = getTransitAction(readingType, transitPlanet);
  const themeMap = getNatalThemeMap(readingType);
  // Bug 2 — never emit the generic "a major part of your personal pattern" line.
  // If the planet/point is missing from the theme map, name it explicitly.
  const natalTheme = themeMap[natalPlanet] ?? buildPlanetNamedFallback(natalPlanet, readingType);
  const contextPhrase = getContextPhrase(readingType);

  const retrogradeSentence = isRetrograde
    ? `Because ${transitPlanet} is retrograde on at least one pass, the situation tends to revisit, get reconsidered, or pull you back in instead of moving in one clean direction.`
    : '';

  return `${aspectTone}. ${contextPhrase} ${transitPlanet} ${transitAction} around ${natalTheme}. ${passSummary}${retrogradeSentence ? ` ${retrogradeSentence}` : ''}`;
};

const buildTimingWindowDescription = (
  window: {
    transitPlanet: string;
    aspect: string;
    natalPlanet: string;
    natalDegree: string;
    exactDates: { date: string; label: string }[];
  },
  readingType: TimingReadingType,
): string => {
  // ROOT-CAUSE FIX: Hard-validate every input field. Any missing field guarantees
  // a malformed body, so we return empty here and the caller is required to drop
  // the entire window.
  const tp = (window.transitPlanet ?? '').trim();
  const asp = (window.aspect ?? '').trim();
  const np = (window.natalPlanet ?? '').trim();
  const exactDates = Array.isArray(window.exactDates) ? window.exactDates : [];
  if (!tp || !asp || !np || exactDates.length === 0) {
    // eslint-disable-next-line no-console
    console.error('[buildTimingWindowDescription] MISSING FIELDS — dropping window', {
      transitPlanet: tp, aspect: asp, natalPlanet: np, exactDatesCount: exactDates.length,
    });
    return '';
  }

  const exactSummary = exactDates
    .map((exact) => `${exact.date}${exact.label !== 'single pass' ? ` (${exact.label})` : ''}`)
    .filter((s) => s && s.trim().length > 0)
    .join('; ');

  if (!exactSummary) {
    console.error('[buildTimingWindowDescription] EMPTY exactSummary — dropping window', { tp, asp, np });
    return '';
  }

  // Bug 3 — developmental override for the short window description as well.
  const devOverride = getDevelopmentalMilestoneInterpretation(
    tp, asp, np, readingType, `Peaks: ${exactSummary}.`, false,
  );
  if (devOverride && devOverride.trim().length > 0) return devOverride;

  const aspectTone = (buildSpecificOpener(tp, asp, np, readingType) ?? '').trim();
  const transitAction = (getTransitAction(readingType, tp) ?? '').trim();
  const themeMap = getNatalThemeMap(readingType);
  const natalTheme = (themeMap[np] ?? buildPlanetNamedFallback(np, readingType) ?? '').trim();

  // Hard guard: any required component empty => return '' so the window is dropped.
  if (!aspectTone || !transitAction || !natalTheme) {
    console.error('[buildTimingWindowDescription] EMPTY component — dropping window', {
      tp, asp, np, readingType,
      hasAspectTone: !!aspectTone, hasTransitAction: !!transitAction, hasNatalTheme: !!natalTheme,
    });
    return '';
  }

  return `${aspectTone}. ${tp} ${transitAction} around ${natalTheme}. Peaks: ${exactSummary}.`;
};

export const getTimingTagDetails = (tag: string) => {
  return TAG_ACTION_MAP[tag] ?? { label: tag, watch: '' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Bug 2 — deduplicate transits: one row per (planet, aspect, natal_point)
// ─────────────────────────────────────────────────────────────────────────────
export function buildDeterministicTimingData(
  chart: NatalChart | null,
  monthsAhead: number = 18,
  maxTransits: number = 15,
  readingType: TimingReadingType = 'relationship',
): FutureTimingData {
  const natalPositions = buildNatalPositions(chart);
  if (natalPositions.length === 0) {
    return { context: '', section: null };
  }

  const windows = scanFutureTransits(natalPositions, monthsAhead);
  if (windows.length === 0) {
    return { context: '', section: null };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITY SORT — applied BEFORE the maxTransits cap so headline transits
  // (Jupiter→Sun, Jupiter→MC, returns, Saturn→Sun, etc.) are never silently
  // dropped just because they happen later in the date window than 15 other
  // smaller transits. Lower priorityScore = higher priority = scanned first.
  // ─────────────────────────────────────────────────────────────────────────
  const tenthHousePlanets = new Set<string>();
  const eleventhHousePlanets = new Set<string>();
  if (chart?.planets) {
    for (const [name, data] of Object.entries(chart.planets)) {
      const house = (data as { house?: number })?.house;
      if (house === 10) tenthHousePlanets.add(name);
      if (house === 11) eleventhHousePlanets.add(name);
    }
  }

  const transitPlanetWeight: Record<string, number> = {
    Pluto: 0, Neptune: 1, Uranus: 2, Saturn: 3, Jupiter: 4,
  };
  const natalPointWeight = (name: string): number => {
    if (name === 'Sun') return 0;
    if (name === 'Moon') return 1;
    if (name === 'Ascendant' || name === 'ASC') return 1;
    if (name === 'Midheaven' || name === 'MC') return 1;
    if (tenthHousePlanets.has(name)) return 2;
    if (eleventhHousePlanets.has(name)) return 3;
    if (name === 'NorthNode' || name === 'North Node') return 3;
    if (['Mercury', 'Venus', 'Mars'].includes(name)) return 4;
    return 6;
  };
  const aspectWeight: Record<string, number> = {
    conjunction: 0, opposition: 1, square: 2, trine: 2, sextile: 3,
  };

  const priorityScore = (w: typeof windows[number]): number => {
    const tp = transitPlanetWeight[w.transitPlanet] ?? 5;
    const np = natalPointWeight(w.natalPlanet);
    const asp = aspectWeight[w.aspect] ?? 4;
    // Mandatory headline floor: ANY Jupiter aspect to Sun, MC, or a 10th-house
    // planet is treated as top-tier so it survives the 15-cap regardless of date.
    const isJupiterCareerHeadline =
      w.transitPlanet === 'Jupiter' &&
      (w.natalPlanet === 'Sun' ||
        w.natalPlanet === 'Midheaven' || w.natalPlanet === 'MC' ||
        tenthHousePlanets.has(w.natalPlanet));
    if (isJupiterCareerHeadline) return -100 + asp;
    return tp * 10 + np * 2 + asp;
  };

  const prioritizedWindows = [...windows].sort((a, b) => priorityScore(a) - priorityScore(b));

  const transits: DeterministicTimingTransit[] = [];
  const includedWindows: typeof windows = [];

  for (const window of prioritizedWindows) {
    if (!Array.isArray(window.exactDates) || window.exactDates.length === 0) continue;

    // Compute per-pass details once so we can both group them and detect any retrograde pass
    const passDetails = window.exactDates.map((exact) => {
      const exactDate = new Date(exact.date);
      const exactLongitude = Number.isNaN(exactDate.getTime())
        ? null
        : getPlanetLongitudeExact(TRANSIT_BODIES[window.transitPlanet], exactDate);
      const exactDegree = exactLongitude === null ? window.natalDegree : longitudeToSignDegree(exactLongitude);
      const retrograde = Number.isNaN(exactDate.getTime())
        ? /retrograde/i.test(exact.label) || window.isRetrograde
        : isRetrogradeAtExactHit(window.transitPlanet, exactDate, exact.label);
      return {
        date: exact.date,
        label: exact.label,
        exactDegree,
        retrograde,
      };
    });

    if (passDetails.length === 0) continue;

    const anyRetrograde = passDetails.some((p) => p.retrograde);
    const natalPoint = `${window.natalPlanet} at ${window.natalDegree}`;
    const humanizedRange = humanizeDateRange(window.dateRange);

    // Build the consolidated pass label / dates
    const isMultiPass = passDetails.length > 1;
    const passLabel = isMultiPass
      ? `multi-pass (${passDetails.length} passes)`
      : passDetails[0].label;

    // For exact_hit_date: if multi-pass, list all exact dates joined by " · "
    const exactHitDate = passDetails.map((p) => p.date).join(' · ');

    // For exact_degree on the row: use the first pass's exact degree, append (R) if any pass is retrograde
    const primaryDegree = passDetails[0].exactDegree;
    const exactDegreeLabel = anyRetrograde ? `${primaryDegree} (R)` : primaryDegree;

    // Position string lists all passes with their per-pass labels
    const passesPositionSummary = passDetails
      .map((p) => {
        const tag = p.label && p.label !== 'single pass' ? ` (${p.label})` : '';
        return `${p.date}${tag}`;
      })
      .join(', ');

    const position = `${window.transitPlanet} ${window.aspect} natal ${natalPoint} — exact ${passesPositionSummary}`;

    // Pass summary sentence used by the interpretation builder
    const passSummary = isMultiPass
      ? `This is a multi-pass cycle covering ${passDetails.length} exact hits (${passesPositionSummary}); the full felt-sense window runs ${humanizedRange}.`
      : `The story peaks on ${passDetails[0].date} and the full felt-sense window runs ${humanizedRange} — meaning the theme builds, peaks, then settles inside that range.`;

    const interpretationText = buildTransitInterpretation({
      transitPlanet: window.transitPlanet,
      aspect: window.aspect,
      natalPlanet: window.natalPlanet,
      natalDegree: window.natalDegree,
      passSummary,
      isRetrograde: anyRetrograde,
      readingType,
    });

    // Bug 1 — never push a transit with an empty body. A blank entry is worse
    // than a missing one. If for any reason the interpretation pipeline returns
    // empty/whitespace text, OR the natal target is missing, drop the entry.
    const hasNatalTarget = !!window.natalPlanet && window.natalPlanet.trim().length > 0;
    const hasBody = !!interpretationText && interpretationText.trim().length > 0;
    if (!hasNatalTarget || !hasBody) {
      // eslint-disable-next-line no-console
      console.warn('[deterministicTiming] Dropping malformed transit entry', {
        transitPlanet: window.transitPlanet,
        aspect: window.aspect,
        natalPlanet: window.natalPlanet,
        hasNatalTarget,
        hasBody,
      });
      continue;
    }

    const consolidatedTransit: DeterministicTimingTransit = {
      planet: window.transitPlanet,
      symbol: PLANET_SYMBOLS[window.transitPlanet] ?? '',
      position,
      aspect: window.aspect,
      exact_degree: exactDegreeLabel,
      natal_point: natalPoint,
      first_applying_date: humanizeDateRange(window.enterDate),
      exact_hit_date: exactHitDate,
      separating_end_date: humanizeDateRange(window.exitDate),
      pass_label: passLabel,
      date_range: humanizedRange,
      tag: classifyTimingTag(window.transitPlanet, window.aspect, window.natalPlanet, readingType),
      interpretation: interpretationText,
    };

    includedWindows.push(window);
    transits.push(consolidatedTransit);

    if (transits.length >= maxTransits) break;
  }

  // After the priority cap, re-sort the kept transits chronologically so the
  // reader sees them in date order in the final output.
  const chronoCompare = (a: DeterministicTimingTransit, b: DeterministicTimingTransit) => {
    const aDate = new Date(a.first_applying_date.replace(/\s+to\s+.*$/, '')).getTime();
    const bDate = new Date(b.first_applying_date.replace(/\s+to\s+.*$/, '')).getTime();
    if (Number.isNaN(aDate) || Number.isNaN(bDate)) return 0;
    return aDate - bDate;
  };
  transits.sort(chronoCompare);

  // Final dedup safety net keyed on (planet, aspect, natal_point)
  const seen = new Set<string>();
  const dedupedTransits: DeterministicTimingTransit[] = [];
  for (const t of transits) {
    const key = `${t.planet}|${t.aspect}|${t.natal_point}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // Final hardening: ensure tag is non-empty and Title-Case
    const safeTag = (t.tag && t.tag.trim()) || 'Turning-Point';
    dedupedTransits.push({ ...t, tag: safeTag });
  }

  const limitedTransits = dedupedTransits.slice(0, maxTransits);
  if (limitedTransits.length === 0) {
    return {
      context: formatFutureTransitsContext(windows),
      section: null,
    };
  }

  // Build windows array, dropping any whose label or description is missing
  // or empty after trimming. This is rule #1 — incomplete entries never enter
  // the array in the first place.
  type RawWindowEntry = { label: string; description: string; dateRange: unknown };
  const windowEntries: RawWindowEntry[] = [];
  for (const w of includedWindows) {
    const rawLabel = humanizeDateRange(w.dateRange);
    const rawDescription = buildTimingWindowDescription(w, readingType);
    const label = typeof rawLabel === 'string' ? rawLabel.trim() : '';
    const description = typeof rawDescription === 'string' ? rawDescription.trim() : '';
    if (!label || !description) {
      console.warn('[buildDeterministicTimingData] DROPPING window with empty label/description', {
        transitPlanet: w.transitPlanet, aspect: w.aspect, natalPlanet: w.natalPlanet,
        dateRange: w.dateRange, label, descriptionLength: description.length,
      });
      continue;
    }
    windowEntries.push({ label, description, dateRange: w.dateRange });
  }

  // ───────────────────────────────────────────────────────────────────────
  // RULE #2 — NORMALIZED DEDUPLICATION (shared helper)
  // Delegates to `dedupWindows` from `./timingWindowDedup` — the single
  // source of truth used identically by the edge function sanitizer and
  // the pre-export validator. Uses ISO date-range when available, falling
  // back to the normalized label key.
  // ───────────────────────────────────────────────────────────────────────
  const dedupResult = dedupWindows(windowEntries);
  for (const stat of dedupResult.mergeStats) {
    if (stat.mergedCount > 1) {
      console.info('[buildDeterministicTimingData] Merged duplicate window', {
        key: stat.key, label: stat.label, mergedCount: stat.mergedCount,
      });
    }
  }
  const dedupedWindowEntries = dedupResult.windows;

  // ───────────────────────────────────────────────────────────────────────
  // RULE #3 — FRAGMENT DETECTION
  // After dedup, log any window whose description is shorter than 20 chars.
  // These usually indicate a partial generation failure that produced a
  // fragment instead of real interpretive content.
  // ───────────────────────────────────────────────────────────────────────
  for (const w of dedupedWindowEntries) {
    if (w.description.trim().length < 20) {
      console.error('[buildDeterministicTimingData] SUSPICIOUSLY SHORT window description (<20 chars)', {
        label: w.label, descriptionLength: w.description.trim().length, description: w.description,
      });
    }
  }

  // Diagnostic: log every window that survives so we can trace blank-card bugs
  console.info('[buildDeterministicTimingData] Final windows array (post-dedup)', {
    rawCount: windowEntries.length,
    finalCount: dedupedWindowEntries.length,
    windows: dedupedWindowEntries.map((w) => ({
      label: w.label,
      descLen: w.description.length,
      descPreview: w.description.slice(0, 80),
    })),
  });

  // ───────────────────────────────────────────────────────────────────────
  // HARD SCHEMA VALIDATION CONTRACT
  // Every transit and window MUST satisfy the strict schema before leaving
  // this function. Anything that fails is logged with the full offending
  // object and dropped at source. The renderer never sees malformed data.
  // ───────────────────────────────────────────────────────────────────────
  const transitValidation = validateEntries(
    limitedTransits as unknown as Record<string, unknown>[],
    TimingTransitSchema as never,
    'transits',
  );
  const windowValidation = validateEntries(
    dedupedWindowEntries as unknown as Record<string, unknown>[],
    TimingWindowSchema as never,
    'windows',
  );

  if (transitValidation.failures.length > 0 || windowValidation.failures.length > 0) {
    console.error('[buildDeterministicTimingData] Schema violations dropped at source', {
      transitFailures: transitValidation.failures.length,
      windowFailures: windowValidation.failures.length,
      transitFailureDetail: transitValidation.failures,
      windowFailureDetail: windowValidation.failures,
    });
  }

  const finalSection: DeterministicTimingSection = {
    type: 'timing_section',
    title: 'Timing Windows',
    transits: transitValidation.kept as unknown as DeterministicTimingTransit[],
    windows: windowValidation.kept as unknown as DeterministicTimingWindow[],
  };

  // Belt-and-braces: re-assert. Throws in dev so any future code path that
  // bypasses validation is caught at the boundary instead of in production.
  assertTimingSectionIsClean(finalSection);

  if (finalSection.transits.length === 0 && finalSection.windows.length === 0) {
    return {
      context: formatFutureTransitsContext(windows),
      section: null,
    };
  }

  return {
    context: formatFutureTransitsContext(windows),
    section: finalSection,
  };
}

export function mergeDeterministicTimingSection(data: any, timingSection: DeterministicTimingSection | null) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.sections) || !timingSection) {
    return data;
  }

  const timingIndex = data.sections.findIndex((section: { type?: string }) => section?.type === 'timing_section');

  if (timingIndex >= 0) {
    data.sections[timingIndex] = {
      ...data.sections[timingIndex],
      title: data.sections[timingIndex].title || timingSection.title,
      transits: timingSection.transits,
      windows: timingSection.windows,
    };
    return data;
  }

  const summaryIndex = data.sections.findIndex((section: { type?: string }) => section?.type === 'summary_box');
  if (summaryIndex >= 0) {
    data.sections.splice(summaryIndex, 0, timingSection);
    return data;
  }

  data.sections.push(timingSection);
  return data;
}
