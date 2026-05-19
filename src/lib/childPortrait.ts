// Deterministic "Luminary" Child Portrait builder.
// All logic is computed from chart data. No AI calls.

import type { NatalChart, NatalPlanetPosition } from "@/hooks/useNatalChart";

// ── Constants ────────────────────────────────────────────────────────────────
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const ELEMENT_OF_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const HOUSE_THEME: Record<number, string> = {
  1: "identity and how they show up",
  2: "values, body, and what feels safe",
  3: "communication, siblings, and daily learning",
  4: "home, family, and their inner base",
  5: "play, creativity, and self-expression",
  6: "routine, health, and daily competence",
  7: "one-on-one relationships and mirrors",
  8: "shared resources, intimacy, and deep change",
  9: "meaning, travel, and the bigger picture",
  10: "public role and what they're known for",
  11: "friends, peers, and where they belong",
  12: "rest, privacy, and the inner world",
};

// Major aspects with tight orbs (luminary-sensitive)
const MAJOR_ASPECTS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 7 },
  { name: "sextile", angle: 60, orb: 5 },
] as const;

type AspectName = typeof MAJOR_ASPECTS[number]["name"];
const HARD_ASPECTS: AspectName[] = ["conjunction", "opposition", "square"];

// ── Helpers ──────────────────────────────────────────────────────────────────
function absLon(p?: NatalPlanetPosition): number | null {
  if (!p?.sign) return null;
  const idx = SIGNS.indexOf(p.sign);
  if (idx < 0) return null;
  const deg = typeof p.degree === "number" ? p.degree : 0;
  return idx * 30 + deg;
}

function cuspAbs(c?: { sign: string; degree?: number }): number | null {
  if (!c?.sign) return null;
  const idx = SIGNS.indexOf(c.sign);
  if (idx < 0) return null;
  return idx * 30 + (c.degree ?? 0);
}

function houseOf(chart: NatalChart, planet?: NatalPlanetPosition): number | null {
  if (!planet || !chart.houseCusps) return null;
  const pAbs = absLon(planet);
  if (pAbs == null) return null;
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = (chart.houseCusps as any)[`house${i}`];
    const v = cuspAbs(c);
    if (v == null) return null;
    cusps.push(v);
  }
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const inside = start < end ? pAbs >= start && pAbs < end : pAbs >= start || pAbs < end;
    if (inside) return i + 1;
  }
  return null;
}

function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const [y, mo, d] = birthDate.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const now = new Date();
  let a = now.getFullYear() - y;
  const before = now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d);
  if (before) a--;
  return a >= 0 ? a : null;
}

function aspectBetween(a?: NatalPlanetPosition, b?: NatalPlanetPosition): { name: AspectName; orb: number } | null {
  const la = absLon(a);
  const lb = absLon(b);
  if (la == null || lb == null) return null;
  let diff = Math.abs(la - lb) % 360;
  if (diff > 180) diff = 360 - diff;
  for (const asp of MAJOR_ASPECTS) {
    const orb = Math.abs(diff - asp.angle);
    if (orb <= asp.orb) return { name: asp.name, orb };
  }
  return null;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Sign-flavored fragments (kept short, behavioral, not horoscope-y) ────────
const MOON_SAFETY_BY_SIGN: Record<string, string> = {
  Aries: "moving their body, quick wins, being met with energy not lectures",
  Taurus: "predictable rhythm, food, soft textures, and not being rushed",
  Gemini: "being talked with (not at), curiosity questions, choices, and humor",
  Cancer: "physical closeness, soft tone, knowing the plan, and being asked how they feel",
  Leo: "warm eye contact, being noticed sincerely, dignity preserved in front of others",
  Virgo: "small competent tasks, clean order, knowing what helps and how",
  Libra: "calm tone in the room, fairness named out loud, beauty in their space",
  Scorpio: "being trusted with the real story, privacy respected, eye contact one-on-one",
  Sagittarius: "honesty, room to roam, the big-picture 'why' before the rules",
  Capricorn: "clear structure, real responsibility, being treated as capable",
  Aquarius: "being treated as their own person, space to be 'different,' logic over guilt",
  Pisces: "soft sensory input, imagination welcomed, low-volume environments, naps",
};

const VENUS_LOVE_BY_SIGN: Record<string, string> = {
  Aries: "playful challenge and shared physical doing",
  Taurus: "food, touch, and steady presence",
  Gemini: "shared jokes and being asked their opinion",
  Cancer: "snuggles, food, and rituals of return",
  Leo: "celebration, attention, and 'I'm proud of you' said directly",
  Virgo: "acts of service, doing a small useful task together",
  Libra: "shared aesthetic moments and being told 'I picked this for you'",
  Scorpio: "one-on-one intensity and being kept as their secret-keeper",
  Sagittarius: "adventures, shared laughter, and big-idea conversations",
  Capricorn: "being respected and given real responsibility",
  Aquarius: "being met as a peer in conversation",
  Pisces: "music, story, and quiet shared imagination",
};

const MARS_RESET_BY_SIGN: Record<string, string> = {
  Aries: "discharge first (run, jump, wrestle a pillow); talk second",
  Taurus: "give them a physical anchor (food, blanket, ground); pace down",
  Gemini: "let them talk it out fast; give them words for the feeling",
  Cancer: "co-regulate with closeness or water before discussing anything",
  Leo: "warmth and acknowledgment first; never shame in front of others",
  Virgo: "give them a small task that restores order; the body settles",
  Libra: "name what is fair and what is not; restore balance verbally",
  Scorpio: "go private, low tone, one-on-one; do not corner them in public",
  Sagittarius: "let them move and roam; talk while walking, not face-to-face",
  Capricorn: "name the plan and the boundary clearly; give them control of a piece",
  Aquarius: "give them space and logic; no guilt-tripping",
  Pisces: "reduce stimulation; soft lighting, music, water",
};

const MOON_HARD_ASPECT_NOTE: Record<string, string> = {
  Saturn: "Their sense of safety is wired with a 'prove it' clause. They need extra holding, extra repetition that the door is still open, and time-in (not time-out). Pulling away to teach a lesson tends to register as proof that love is conditional.",
  Pluto: "Their nervous system reads small disruptions as big ones. They need transparency about what's happening in the household and permission to feel the full size of what they feel. Hidden tensions land harder than spoken ones.",
  Mars: "Emotions arrive at full volume and need physical discharge before words. Co-regulate the body first; reasoning lands after.",
  Uranus: "Their moods can shift suddenly and they read unpredictability as unsafe. Routines and 'here's what's next' previews help them settle.",
  Neptune: "They absorb the room's mood as if it were their own. Name your own state out loud so they don't carry the household's unspoken weather.",
  Chiron: "Their early sense of comfort has a tender spot. Repair after rupture matters more than getting it right the first time. Saying 'that wasn't fair, I see it' is medicine.",
};

const SUN_PRACTICE_BY_SIGN: Record<string, string> = {
  Aries: "practicing courage, not 'being impulsive'",
  Taurus: "practicing steady self-worth, not 'being stubborn'",
  Gemini: "practicing curiosity and honest voice, not 'being scattered'",
  Cancer: "practicing tender leadership, not 'being too sensitive'",
  Leo: "practicing generous visibility, not 'showing off'",
  Virgo: "practicing useful precision, not 'being picky'",
  Libra: "practicing fair self-advocacy, not 'people-pleasing'",
  Scorpio: "practicing honest intensity, not 'being dramatic'",
  Sagittarius: "practicing meaning and honesty, not 'being blunt'",
  Capricorn: "practicing earned authority, not 'being too serious'",
  Aquarius: "practicing original perspective, not 'being difficult'",
  Pisces: "practicing compassion with edges, not 'being a dreamer'",
};

const NORTH_NODE_STRETCH_BY_SIGN: Record<string, string> = {
  Aries: "leading from their own initiative, not waiting to be chosen",
  Taurus: "slowing down, building real worth, choosing steadiness over crisis",
  Gemini: "asking the question, gathering many views, staying curious",
  Cancer: "softening into needing people, naming feelings, building home",
  Leo: "stepping into visible self-expression and being the one in the room",
  Virgo: "practical service, refinement, and showing up in the daily details",
  Libra: "real partnership, considering the other person, sharing the wheel",
  Scorpio: "depth, intimacy, and trusting one or two people with the real story",
  Sagittarius: "the bigger picture, meaning, and naming their own truth",
  Capricorn: "earned mastery, structure, and taking the long view",
  Aquarius: "the group, the friend, the future they're building with others",
  Pisces: "letting go of perfection, trusting flow, and resting",
};

const SOUTH_NODE_DEFAULT_BY_SIGN: Record<string, string> = {
  Aries: "going solo and crisis-mode self-reliance",
  Taurus: "comfort, sameness, and refusing to move",
  Gemini: "endless information-gathering instead of choosing",
  Cancer: "retreating into the family bubble or self-soothing alone",
  Leo: "needing the spotlight and the room's approval",
  Virgo: "over-fixing, over-helping, over-correcting",
  Libra: "smoothing the room and disappearing themselves",
  Scorpio: "going private, withholding, controlling through silence",
  Sagittarius: "running to the next big idea before finishing the last one",
  Capricorn: "carrying everything alone and equating worth with output",
  Aquarius: "staying detached and observing instead of participating",
  Pisces: "drifting, dissolving, and waiting to be rescued",
};

// Adult-pivot one-liners: "trade X for Y"
const SN_TIRED_BY_SIGN: Record<string, string> = {
  Aries: "doing it all alone",
  Taurus: "staying in the comfortable rut",
  Gemini: "gathering more information instead of choosing",
  Cancer: "retreating into the family bubble",
  Leo: "needing the spotlight on you",
  Virgo: "over-fixing and over-correcting",
  Libra: "smoothing the room and disappearing yourself",
  Scorpio: "going private and controlling through silence",
  Sagittarius: "running to the next big idea",
  Capricorn: "carrying it all alone",
  Aquarius: "being right",
  Pisces: "drifting and waiting to be rescued",
};

const NN_CALL_BY_SIGN: Record<string, string> = {
  Aries: "leading your own life",
  Taurus: "steady self-worth at your own pace",
  Gemini: "asking the real question out loud",
  Cancer: "letting people in and tending home",
  Leo: "being seen, fully, as yourself",
  Virgo: "useful daily craft",
  Libra: "real partnership and sharing the wheel",
  Scorpio: "depth and intimacy with one or two people",
  Sagittarius: "your own truth out loud",
  Capricorn: "earned, long-arc mastery",
  Aquarius: "the future you're building with others",
  Pisces: "trust, flow, and genuine rest",
};


const SATURN_SACRED_STRUGGLE_BY_SIGN: Record<string, string> = {
  Aries: "trusting their own initiative; they may freeze before acting",
  Taurus: "trusting that they have enough and are enough materially and bodily",
  Gemini: "trusting their voice and their intelligence",
  Cancer: "trusting that softness is safe; they may armor up emotionally",
  Leo: "trusting that being seen will not be punished",
  Virgo: "trusting that 'good enough' is genuinely enough",
  Libra: "trusting that disagreement does not break the bond",
  Scorpio: "trusting another person with the inside",
  Sagittarius: "trusting their own sense of meaning and truth",
  Capricorn: "trusting that worth is not earned through output",
  Aquarius: "trusting that belonging won't cost them their individuality",
  Pisces: "trusting structure and saying no without guilt",
};

const SATURN_HOUSE_SUPPORT: Record<number, string> = {
  1: "their identity and physical presence — never tease their body or how they show up; affirm 'you get to take up space'",
  2: "their sense of worth and material safety — affirm 'you are enough as you are, with what you have'",
  3: "their voice and learning — never correct their words in public; let them finish their sentence",
  4: "their sense of home and belonging — make 'home' explicitly unconditional out loud, repeatedly",
  5: "their right to play and create — never criticize their creative output; celebrate the act, not the product",
  6: "their daily competence and body — never compare their pace to a sibling's; affirm small wins",
  7: "their experience of being chosen — be visibly delighted by their company without conditions",
  8: "their right to privacy and depth — never read their journal or pry; let them come to you",
  9: "their right to their own meaning and beliefs — let them disagree without being corrected",
  10: "their public reputation — never publicly shame them; success-pressure lands sideways",
  11: "their right to belong with peers — protect their friendships and group time",
  12: "their need for genuine alone-time — protect their rest and inner world",
};

// For adults: Saturn-by-house becomes a "Standard" they're claiming
const SATURN_HOUSE_ADULT_STANDARD: Record<number, string> = {
  1: "Self-Presentation Standard",
  2: "Worth Standard",
  3: "Voice Standard",
  4: "Home Standard",
  5: "Creative Standard",
  6: "Daily-Practice Standard",
  7: "Partnership Standard",
  8: "Intimacy Standard",
  9: "Belief Standard",
  10: "Public-Role Standard",
  11: "Community Standard",
  12: "Solitude Standard",
};


const CHIRON_TENDER_BY_SIGN: Record<string, string> = {
  Aries: "feeling weak, behind, or 'less than' physically",
  Taurus: "feeling like they don't have enough or aren't enough materially",
  Gemini: "feeling stupid, mis-heard, or talked over",
  Cancer: "feeling unwelcome, unwanted, or like 'too much'",
  Leo: "feeling invisible, unloved, or laughed at",
  Virgo: "feeling broken, defective, or never quite right",
  Libra: "feeling unchosen, unfair-treated, or pushed aside",
  Scorpio: "feeling betrayed or unsafe to trust",
  Sagittarius: "feeling unfree or that their truth doesn't matter",
  Capricorn: "feeling unworthy unless producing",
  Aquarius: "feeling like the outsider or 'the weird one'",
  Pisces: "feeling unseen in their sensitivity or used",
};

const MERCURY_LEARNING_BY_SIGN: Record<string, string> = {
  Aries: "fast, hands-on, urgency-driven; needs to feel a stake",
  Taurus: "slow, sensory, repetition-friendly; needs to touch it",
  Gemini: "talking, asking, connecting many small pieces",
  Cancer: "story-based, emotional context first, then facts",
  Leo: "performance and demonstration; teaching it to someone else",
  Virgo: "step-by-step, written, with a clear method",
  Libra: "discussion and comparison; weighing options out loud",
  Scorpio: "deep-dive into one thing; the hidden 'why' behind it",
  Sagittarius: "big-picture first, then details; needs the meaning",
  Capricorn: "structured, long-arc, with clear milestones",
  Aquarius: "systems thinking, unusual angles, group brainstorming",
  Pisces: "image, metaphor, music, and absorbing by osmosis",
};

const THIRD_HOUSE_RULER_NUDGE: Record<string, string> = {
  Sun: "they learn best when their effort is visibly seen",
  Moon: "they learn best when they feel safe and unrushed",
  Mercury: "they learn best by talking the idea back at you",
  Venus: "they learn best when the material is beautiful or relational",
  Mars: "they learn best with stakes, challenge, and movement",
  Jupiter: "they learn best when the big-picture 'why' is named first",
  Saturn: "they learn best with structure, milestones, and clear standards",
  Uranus: "they learn best at unusual angles, not in the standard order",
  Neptune: "they learn best through story, image, and absorbed mood",
  Pluto: "they learn best by going deep on one thing at a time",
};

// ── Synthesis libraries: "the why behind the what" ───────────────────────────
const SIGN_FLAVOR_ADJ: Record<string, string> = {
  Aries: "fiery, direct, ready-to-go",
  Taurus: "steady, sensual, slow-building",
  Gemini: "curious, talkative, idea-driven",
  Cancer: "tender, protective, emotionally tuned",
  Leo: "warm, generous, expressive",
  Virgo: "precise, helpful, careful",
  Libra: "fair, relational, peace-seeking",
  Scorpio: "intense, private, depth-driven",
  Sagittarius: "expansive, honest, freedom-loving",
  Capricorn: "disciplined, responsible, long-view",
  Aquarius: "original, independent, future-tilted",
  Pisces: "dreamy, compassionate, porous",
};

const OUTER_AUDIT_VOICE: Record<string, string> = {
  Saturn: "a perfectionist inner critic that audits every move and asks 'is this good enough yet?'",
  Pluto: "an all-or-nothing inner pressure that wants to control the outcome or shut the whole thing down",
  Uranus: "a restless 'exit-button' reflex that wants to disrupt or detach the moment things get too predictable",
};

const OUTER_FEAR_LINE: Record<string, string> = {
  Saturn: "afraid of being 'wrong,' caught short, or seen as incompetent",
  Pluto: "afraid of being overpowered or losing control of the truth",
  Uranus: "afraid of being trapped, predictable, or domesticated",
};

const LUMINARY_NATURE_LINE: Record<string, string> = {
  Sun: "core sense of self and how they shine",
  Moon: "emotional safety and how they soothe",
};

const THIRD_HOUSE_VOICE_TONE: Record<string, string> = {
  Aries: "direct, fast, and to-the-point",
  Taurus: "slow, grounded, and concrete",
  Gemini: "curious and quick with questions",
  Cancer: "warm and emotionally attentive",
  Leo: "expressive and confident",
  Virgo: "precise and analytical",
  Libra: "fair, diplomatic, the peacemaker",
  Scorpio: "private with sudden moments of depth",
  Sagittarius: "big-picture and blunt",
  Capricorn: "measured, structured, and economical with words",
  Aquarius: "objective, cool, and a little unusual",
  Pisces: "soft, image-based, and indirect",
};

const RULER_UNDERCURRENT_BY_SIGN: Record<string, string> = {
  Aries: "an intense, direct fire",
  Taurus: "a stubborn, slow-moving weight",
  Gemini: "a fast, scattered current of ideas",
  Cancer: "a tender protective ache",
  Leo: "a need to be seen and honored",
  Virgo: "a constant inner edit",
  Libra: "a quiet relational calculation",
  Scorpio: "a powerful pressure they're actively managing",
  Sagittarius: "a restless need for the bigger truth",
  Capricorn: "a serious sense of responsibility",
  Aquarius: "a detached, observational coolness",
  Pisces: "an absorbed, mood-soaked current",
};

const HOUSE_UNDERCURRENT_DOMAIN: Record<number, string> = {
  1: "running in their own body and presentation",
  2: "running around money, body, and self-worth",
  3: "running in the conversation itself",
  4: "running around home and family",
  5: "running in creativity, play, and romance",
  6: "running in the daily routine and body",
  7: "running with one partner at a time",
  8: "running around intimacy, power, and shared resources",
  9: "running around belief and the bigger picture",
  10: "running in their public life and reputation",
  11: "running with the group, peers, or future vision",
  12: "running in the inner, private world",
};

// Mercury sign → nervous-system pace (the "why" behind the learning style)
const MERCURY_NERVOUS_SYSTEM_PACE: Record<string, string> = {
  Aries: "fast, urgency-driven, fires before fully thinking; needs a real stake to lock in",
  Taurus: "slow, sensory, repetition-friendly; needs to touch the thing and not be rushed",
  Gemini: "quick and branching; connects many small pieces in real time, gets bored if it stalls",
  Cancer: "story- and feeling-first; needs emotional context before facts will actually land",
  Leo: "warms up through performance; explaining it out loud is how the wiring locks in",
  Virgo: "step-by-step and methodical; gets anxious without a clean procedure to follow",
  Libra: "thinks by comparing options out loud with another person; needs a sounding board",
  Scorpio: "single-focus, deep-dive; needs the hidden 'why' before any surface detail will stick",
  Sagittarius: "big-picture first; the meaning has to be named before the details register",
  Capricorn: "structured and milestone-driven; needs to see the whole staircase to start the first step",
  Aquarius: "needs to understand the 'system' before the 'task'; context first, instructions second",
  Pisces: "image-, metaphor- and music-based; facts arrive sideways through story and atmosphere",
};

// Tight planetary "conversations" — short, behavioral readings for the Mastery Spot.
// Keys are sorted "A-B" alphabetically so lookup is deterministic.
const ASPECT_CONVERSATION: Record<string, { hard: string; soft: string }> = {
  "Moon-Sun": {
    hard: "an internal head/heart split — what they want and what they need don't always match, and they feel both pulls at once",
    soft: "internal alignment between what they want and what they need — the inside and the outside agree",
  },
  "Saturn-Sun": {
    hard: "an inner critic that audits every move and asks 'is this good enough yet?' before they've even started",
    soft: "natural discipline and the ability to play the long game without burning out",
  },
  "Pluto-Sun": {
    hard: "an all-or-nothing pressure around being seen — fully invisible or in full power, rarely in between",
    soft: "natural depth and the ability to regenerate after intense seasons",
  },
  "Sun-Uranus": {
    hard: "a freedom-versus-belonging tug — they bolt the second things feel boxed in",
    soft: "originality and permission to be themselves without apology",
  },
  "Mars-Sun": {
    hard: "drive on overdrive — they push through even when the body is asking them to slow",
    soft: "clean courage and the ability to act on what matters without overthinking",
  },
  "Sun-Venus": {
    hard: "identity tied to being liked — they may shape-shift a little to keep the love",
    soft: "natural warmth and easy magnetism in how they show up",
  },
  "Neptune-Sun": {
    hard: "an identity that blurs in groups — they absorb other people's roles and lose their own outline",
    soft: "imagination and a compassionate, artistic sense of self",
  },
  "Jupiter-Sun": {
    hard: "a tendency to over-promise or over-extend the self before checking capacity",
    soft: "generosity, optimism, and natural authority",
  },
  "Chiron-Sun": {
    hard: "a tender place where being fully themselves felt 'not allowed' early on",
    soft: "the wisdom to see and name other people's hidden wounds with real care",
  },
  "Mars-Moon": {
    hard: "feelings and actions on a hair-trigger — emotion fires before the pause arrives",
    soft: "emotional courage and the ability to act on what they feel without freezing",
  },
  "Moon-Saturn": {
    hard: "emotional self-protection — they may swallow the feeling instead of saying it out loud",
    soft: "emotional steadiness and the ability to hold their own through hard moments",
  },
  "Moon-Pluto": {
    hard: "feelings that arrive in big waves and need full expression before they can release",
    soft: "emotional depth and the capacity to be with other people's intensity without flinching",
  },
  "Moon-Uranus": {
    hard: "mood shifts that surprise even them — predictability has to be built, not assumed",
    soft: "emotional originality and freedom from inherited family patterns",
  },
  "Moon-Neptune": {
    hard: "emotional osmosis — they pick up the room's mood and carry it as if it were their own",
    soft: "deep empathy and a poetic emotional sense",
  },
  "Jupiter-Moon": {
    hard: "feelings that swell big — generosity that can leave them emotionally empty",
    soft: "natural emotional warmth, faith, and easy generosity of heart",
  },
  "Moon-Venus": {
    hard: "love and need tangled — they may confuse being needed with being loved",
    soft: "emotional warmth, easy affection, and a soothing presence",
  },
  "Chiron-Moon": {
    hard: "a tender early-comfort wound — small ruptures register much bigger than they look",
    soft: "compassion and the gift of soothing others through their own remembered tenderness",
  },
  "Mercury-Moon": {
    hard: "feelings and words running on different tracks — they may not have the language for what they feel in real time",
    soft: "the gift of putting emotion into clear, honest language",
  },
};


function aspectConversationKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

const HIDDEN_HOUSE_SHADOW: Record<number, string> = {
  6: "Handle their stress-responses through daily routine, not big sit-down confrontations. They process best while doing something side-by-side (walking, cooking, driving). Formal 'we need to talk' moments feel like an inspection and shut them down.",
  8: "Handle their stress-responses in private and with full honesty. Hidden tensions land harder than spoken ones for this person. They need transparency about what's really going on, never in front of an audience, and they need to know you can be trusted with the real story.",
  12: "Handle their stress-responses in private. Public correction is a major trigger here. They need 1-on-1 'love deposits' to feel safe enough to stop performing. Address things one-on-one, low volume, never in front of others.",
};

// ── Output type ──────────────────────────────────────────────────────────────
export type DevelopmentalStage =
  | "Lunar Phase (0-7)"
  | "Mercury Phase (8-12)"
  | "Mars / Identity Phase (13-21)"
  | "Saturn Return: Building the Foundation (22-35)"
  | "Uranus Opposition: Mid-Life Awakening (36-45)"
  | "Chiron Return: Sacred Healing (46-55)"
  | "Second Saturn Return: Mentorship and Legacy (56-70)"
  | "Eldering Threshold: Integration of the Soul Story (70+)";

export type LifePhaseGroup = "child" | "adult" | "elder";


export interface ChildPortrait {
  name: string;
  age: number | null;
  birthDate?: string;
  lifePhase: LifePhaseGroup;



  developmentalAnchor: {
    stage: DevelopmentalStage;
    focus: string;
    body: string;
    extraHolding?: string;
  };

  // NEW: The lead story — luminary in hard aspect to Saturn/Pluto/Uranus
  coreConflict?: {
    luminary: "Sun" | "Moon";
    luminarySign: string;
    outerPlanet: string;
    outerSign: string;
    aspect: AspectName;
    orb: number;
    synthesis: string;
  };

  // NEW: How they actually communicate (3rd house sign vs. its ruler's placement)
  hiddenEngine?: {
    thirdSign: string;
    rulerName: string;
    rulerSign: string;
    rulerHouse: number | null;
    synthesis: string;
  };

  // NEW: Specific shadow-handling guidance if SN sits in 6/8/12
  shadowGuidance?: {
    southHouse: number;
    instruction: string;
  };

  identityInvitation: {
    rising?: { sign: string; line: string };
    sun?: { sign: string; house: number | null; line: string };
    northNode?: { sign: string; house: number | null; line: string };
    southNode?: { sign: string; house: number | null; line: string };
    // NEW: adult-only one-liner "trade X for Y"
    tradeLine?: string;
  };

  masterySpot: {
    saturn?: { sign: string; house: number | null; struggle: string; howToSupport: string; adultStandardLabel?: string };
    chiron?: { sign: string; house: number | null; tender: string; howToSupport: string };
  };

  // NEW: 45-52 spotlight: the Credentialing of the Wound
  chironReturnSpotlight?: {
    title: string;
    body: string;
  };

  // NEW: shown when the viewer is older than the subject
  viewFromBridge?: {
    body: string;
  };

  // NEW: Chart Ruler — the "Captain of the Ship" (ruler of Ascendant)
  chartRuler?: {
    rulerName: string;
    rulerSign: string;
    rulerHouse: number | null;
    ascSign: string;
    line: string;
  };

  // NEW: Tightest planetary "conversations" — top luminary aspects with behavioral readings
  tightestAspects?: Array<{
    a: string;
    b: string;
    aspect: AspectName;
    orb: number;
    quality: "hard" | "soft";
    line: string;
  }>;



  howTo: {
    ritual: string;
    learningStyle: string;
    boundary: string;
  };

  mathCheck: {
    thirdHouseSign?: string;
    thirdHouseRuler?: string;
    thirdHouseRulerSign?: string;
    thirdHouseRulerHouse?: number | null;
    sunAspects: Array<{ to: string; aspect: AspectName; orb: number }>;
    moonAspects: Array<{ to: string; aspect: AspectName; orb: number }>;
  };
}



// ── Life-cycle helpers ───────────────────────────────────────────────────────
// Anchored to outer-planet cycles: Saturn returns ~29.5 / ~58.9 / ~88.4y.
// Uranus opposition ~41-42y. Chiron return ~50.7y. Uranus return ~84y.
export function lifePhaseFor(age: number | null): LifePhaseGroup {
  if (age == null) return "adult";
  if (age <= 21) return "child";
  if (age <= 69) return "adult";
  return "elder";
}

function buildAdultAnchor(
  age: number,
  name: string,
  sunSign?: string,
  sunHouse?: number | null,
  saturnSign?: string,
  saturnHouse?: number | null,
  chironSign?: string,
  jupiterSign?: string,
  neptuneSign?: string,
  ninthCuspSign?: string,
  tenthCuspSign?: string,
): { stage: DevelopmentalStage; focus: string; body: string; extraHolding?: string } {
  const sunLine = sunSign ? (SUN_PRACTICE_BY_SIGN[sunSign] ?? "their own way of being seen") : "their own way of being seen";
  const sat = saturnSign ? (SATURN_SACRED_STRUGGLE_BY_SIGN[saturnSign] ?? "earned mastery") : "earned mastery";
  const satHouse = saturnHouse && SATURN_HOUSE_SUPPORT[saturnHouse] ? SATURN_HOUSE_SUPPORT[saturnHouse] : null;
  const sunFocus = sunSign && sunHouse ? `${sunSign} Sun in the ${ordinal(sunHouse)} house` : (sunSign ? `${sunSign} Sun` : "Sun");

  if (age <= 35) {
    return {
      stage: "Saturn Return: Building the Foundation (22-35)",
      focus: `${sunFocus} · Saturn ${saturnSign ? `in ${saturnSign}` : ""}`.trim(),
      body: `This is the Saturn Return decade: the soul's first real "is this actually mine?" audit, peaking around 29-30. ${name} is being asked to claim authority over their own life, sign on (or off) to the structures built in their twenties, and stop performing a borrowed version of adulthood. The struggle is ${sat}. What is truly theirs gets real; what was never theirs gets heavy.`,
      extraHolding: satHouse ? `Where to protect them this season: ${satHouse}.` : undefined,
    };
  }
  if (age <= 45) {
    return {
      stage: "Uranus Opposition: Mid-Life Awakening (36-45)",
      focus: `${sunFocus} · Uranus opposing natal Uranus`,
      body: `Around 41-42, Uranus opposes itself. ${name} is feeling the "is this the only life I get?" question in the body, and the Sun's old definition of self is being re-evaluated for truth. The work is not to blow up the structure but to let the parts that are genuinely false fall off. Practicing ${sunLine} is the antidote to acting out the awakening sideways.`,
    };
  }
  if (age <= 55) {
    const jup = jupiterSign ? ` Jupiter in ${jupiterSign} is the meaning-maker that turns the wound into teaching.` : "";
    const chi = chironSign ? `Chiron in ${chironSign} is returning to its natal place around age 50.` : "Chiron is returning to its natal place around age 50.";
    return {
      stage: "Chiron Return: Sacred Healing (46-55)",
      focus: `${sunFocus} · Chiron ${chironSign ? `in ${chironSign}` : ""} · Jupiter ${jupiterSign ? `in ${jupiterSign}` : ""}`.trim(),
      body: `${chi} ${name} is being asked to find the wisdom in the wound, not to re-injure but to integrate. What used to be "the sore spot" becomes the credential.${jup} The struggle continues to be ${sat}, but with more authority now.`,
    };
  }
  if (age <= 70) {
    const tenth = tenthCuspSign ? ` The 10th-house cusp in ${tenthCuspSign} colors what legacy looks like for them.` : "";
    return {
      stage: "Second Saturn Return: Mentorship and Legacy (56-70)",
      focus: `${sunFocus} · second Saturn Return · 10th house ${tenthCuspSign ?? ""}`.trim(),
      body: `The second Saturn Return (~58-60) is the transition to mentorship. ${name} is being asked: what is yours to keep carrying, what gets handed down, and what gets put down for good?${tenth} Legacy questions get loud. The honest answer becomes the next chapter, and the role shifts from doer to elder-in-training.`,
      extraHolding: satHouse ? `Tender area to honor: ${satHouse}.` : undefined,
    };
  }
  const ninth = ninthCuspSign ? `The 9th-house cusp in ${ninthCuspSign} colors the philosophy they're now living from.` : "The 9th-house themes of meaning, philosophy, and spirit move to the foreground.";
  const nep = neptuneSign ? ` Neptune ${neptuneSign ? `in ${neptuneSign}` : ""} is the dissolver of small identity, opening room for the larger story.` : "";
  return {
    stage: "Eldering Threshold: Integration of the Soul Story (70+)",
    focus: `${sunFocus} · 9th house ${ninthCuspSign ?? ""} · Neptune ${neptuneSign ?? ""}`.trim(),
    body: `${name} is in the integration phase: the lifetime is becoming one story, not a list of events. ${ninth}${nep} The work is the peace of perspective: what is loved gets named out loud, what is forgiven gets released, and presence becomes the gift in the room.`,
  };
}



// ── Builder ──────────────────────────────────────────────────────────────────
export function buildChildPortrait(chart: NatalChart, viewerAge?: number | null): ChildPortrait | null {
  const planets = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const Sun = planets.Sun;
  const Moon = planets.Moon;
  const Mercury = planets.Mercury;
  const Venus = planets.Venus;
  const Mars = planets.Mars;
  const Saturn = planets.Saturn;
  const Chiron = planets.Chiron;
  const NorthNode = planets.NorthNode;
  const SouthNode = planets.SouthNode;
  const Asc = chart.houseCusps?.house1
    ? { sign: chart.houseCusps.house1.sign, degree: chart.houseCusps.house1.degree ?? 0 } as NatalPlanetPosition
    : planets.Ascendant;

  if (!Sun?.sign && !Moon?.sign) return null;

  const age = ageFromBirthDate(chart.birthDate);

  // === 1. Developmental Anchor ============================================
  const moonSign = Moon?.sign;
  const moonHouse = houseOf(chart, Moon);
  const mercurySign = Mercury?.sign;
  const mercuryHouse = houseOf(chart, Mercury);
  const marsSign = Mars?.sign;
  const marsHouse = houseOf(chart, Mars);
  const sunSign = Sun?.sign;
  const sunHouse = houseOf(chart, Sun);

  // 3rd house ruler — for both Mercury stage and learning style
  const thirdCuspSign = chart.houseCusps?.house3?.sign;
  const thirdRulerName = thirdCuspSign ? TRADITIONAL_RULERS[thirdCuspSign] : undefined;
  const thirdRuler = thirdRulerName ? planets[thirdRulerName] : undefined;
  const thirdRulerSign = thirdRuler?.sign;
  const thirdRulerHouse = thirdRuler ? houseOf(chart, thirdRuler) : null;

  // Hard aspects to Moon for the "extra holding" callout
  const hardToMoon: Array<{ to: string; aspect: AspectName; orb: number }> = [];
  const moonAspects: Array<{ to: string; aspect: AspectName; orb: number }> = [];
  const sunAspects: Array<{ to: string; aspect: AspectName; orb: number }> = [];
  const others = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"];
  for (const name of others) {
    if (name === "Moon" || !Moon) continue;
    const asp = aspectBetween(Moon, planets[name]);
    if (asp) {
      moonAspects.push({ to: name, aspect: asp.name, orb: asp.orb });
      if (HARD_ASPECTS.includes(asp.name) && MOON_HARD_ASPECT_NOTE[name]) {
        hardToMoon.push({ to: name, aspect: asp.name, orb: asp.orb });
      }
    }
  }
  for (const name of others) {
    if (name === "Sun" || !Sun) continue;
    const asp = aspectBetween(Sun, planets[name]);
    if (asp) sunAspects.push({ to: name, aspect: asp.name, orb: asp.orb });
  }
  moonAspects.sort((a, b) => a.orb - b.orb);
  sunAspects.sort((a, b) => a.orb - b.orb);
  hardToMoon.sort((a, b) => a.orb - b.orb);

  let stage: DevelopmentalStage = "Lunar Phase (0-7)";
  let focus = "";
  let body = "";
  let extraHolding: string | undefined;

  if (age != null && age <= 7) {
    stage = "Lunar Phase (0-7)";
    focus = moonSign && moonHouse
      ? `${moonSign} Moon in the ${ordinal(moonHouse)} house`
      : moonSign
        ? `${moonSign} Moon`
        : "Moon";
    const safety = moonSign ? MOON_SAFETY_BY_SIGN[moonSign] : "predictability, calm tone, and being met where they are";
    const houseClause = moonHouse ? ` Their emotional weather plays out around ${HOUSE_THEME[moonHouse]}.` : "";
    body = `At this age, their whole nervous system is the curriculum. ${chart.name}'s safety is built through ${safety}.${houseClause} Repetition of small calm moments matters more than any single big talk.`;
    if (hardToMoon.length > 0) {
      const top = hardToMoon[0];
      extraHolding = MOON_HARD_ASPECT_NOTE[top.to];
    }
  } else if (age != null && age <= 12) {
    stage = "Mercury Phase (8-12)";
    const merc = mercurySign && mercuryHouse
      ? `${mercurySign} Mercury in the ${ordinal(mercuryHouse)} house`
      : mercurySign
        ? `${mercurySign} Mercury`
        : "Mercury";
    const learn = mercurySign ? MERCURY_LEARNING_BY_SIGN[mercurySign] : "their own pace and method";
    const rulerLine = thirdRulerName && thirdRulerSign
      ? ` The 3rd-house ruler (${thirdRulerName} in ${thirdRulerSign}${thirdRulerHouse ? `, ${ordinal(thirdRulerHouse)} house` : ""}) tells you their internal operating system: ${THIRD_HOUSE_RULER_NUDGE[thirdRulerName] ?? "they learn through their own filter"}.`
      : "";
    focus = merc + (thirdCuspSign ? ` · 3rd-house cusp in ${thirdCuspSign}` : "");
    body = `This is the operating-system phase. ${chart.name} is building how they think, take in information, and talk to themselves. They learn best ${learn}.${rulerLine}`;
  } else if (age != null && age <= 21) {
    stage = "Mars / Identity Phase (13-21)";
    const mars = marsSign && marsHouse
      ? `${marsSign} Mars in the ${ordinal(marsHouse)} house`
      : marsSign
        ? `${marsSign} Mars`
        : "Mars";
    const sun = sunSign && sunHouse
      ? `${sunSign} Sun in the ${ordinal(sunHouse)} house`
      : sunSign
        ? `${sunSign} Sun`
        : "Sun";
    focus = `${mars} · ${sun}`;
    const reset = marsSign ? MARS_RESET_BY_SIGN[marsSign] : "physical discharge before reasoning";
    const practice = sunSign ? SUN_PRACTICE_BY_SIGN[sunSign] : "their own way of being seen";
    body = `This is the will-and-identity phase. ${chart.name} is testing how they push back, take up space, and become someone independent of the family. When the system overheats, the reset is: ${reset}. The self they are practicing is ${practice}.`;
  } else {
    const adultAge = age ?? 30;
    const ninthCuspSign = chart.houseCusps?.house9?.sign;
    const tenthCuspSign = chart.houseCusps?.house10?.sign;
    const anchor = buildAdultAnchor(
      adultAge,
      chart.name,
      sunSign,
      sunHouse,
      Saturn?.sign,
      houseOf(chart, Saturn),
      Chiron?.sign,
      planets.Jupiter?.sign,
      planets.Neptune?.sign,
      ninthCuspSign,
      tenthCuspSign,
    );
    stage = anchor.stage;
    focus = anchor.focus;
    body = anchor.body;
    if (anchor.extraHolding) extraHolding = anchor.extraHolding;
  }



  // === 2. Identity Invitation =============================================
  const ascSign = Asc?.sign;
  const risingLine = ascSign
    ? `The Rising in ${ascSign} is the filter ${chart.name} uses to first read any room: it is the surface presentation, not the inner self. People meet this first.`
    : "";
  const sunLine = sunSign
    ? `The Sun in ${sunSign}${sunHouse ? ` (${ordinal(sunHouse)} house, around ${HOUSE_THEME[sunHouse]})` : ""} is what they are practicing, not what they already are: ${SUN_PRACTICE_BY_SIGN[sunSign] ?? "their own way of shining"}.`
    : "";
  const phase = lifePhaseFor(age);
  const nnSign = NorthNode?.sign;
  const nnHouse = houseOf(chart, NorthNode);
  const nnDefault = nnSign ? (NORTH_NODE_STRETCH_BY_SIGN[nnSign] ?? "the direction they're growing toward") : "";
  const nnLine = nnSign
    ? phase === "child"
      ? `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""} is the soul's stretch: ${nnDefault}. It will feel uncomfortable on purpose.`
      : phase === "elder"
        ? `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""}: the lessons mastered here are ${nnDefault}. This is the wisdom they've earned the right to teach.`
        : `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""} is the unfolding future: ${nnDefault}. It still feels uncomfortable on purpose, and it is the most honest direction.`
    : "";
  const snSign = SouthNode?.sign;
  const snHouse = houseOf(chart, SouthNode);
  const snDefault = snSign ? (SOUTH_NODE_DEFAULT_BY_SIGN[snSign] ?? "their familiar fallback") : "";
  const snTired = snSign ? (SN_TIRED_BY_SIGN[snSign] ?? snDefault) : "";
  const nnCall = nnSign ? (NN_CALL_BY_SIGN[nnSign] ?? nnDefault) : "";
  const snLine = snSign
    ? phase === "child"
      ? `South Node in ${snSign}${snHouse ? ` (${ordinal(snHouse)} house)` : ""} is their default mode under stress: ${snDefault}. It is comfortable but small. The growth is gently away from this.`
      : phase === "elder"
        ? `South Node in ${snSign}${snHouse ? ` (${ordinal(snHouse)} house)` : ""}: the habit of ${snDefault} is now an old friend they no longer need to keep proving wrong. They've already grown past it.`
        : `South Node in ${snSign}${snHouse ? ` (${ordinal(snHouse)} house)` : ""} is the Tired Habit: ${snDefault}. It is comfortable, it is familiar, and it is no longer where the energy lives.`
    : "";

  // Adult-only "trade X for Y" pivot line
  const tradeLine = phase === "adult" && snTired && nnCall
    ? `Trade ${snTired} for ${nnCall}. The Tired Habit feels safe, but the Vitalizing Edge is where the actual life is right now.`
    : undefined;

  // For adults, reframe NN line as "The Vitalizing Edge"
  const nnLineFinal = nnSign && phase === "adult"
    ? `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""} is the Vitalizing Edge: ${nnDefault}. This is where energy returns when ${chart.name} stops doing the Tired Habit and lets this lead instead.`
    : nnLine;

  // === 3. Mastery Spot ====================================================
  const saturnSign = Saturn?.sign;
  const saturnHouse = houseOf(chart, Saturn);
  const isAdultLike = phase === "adult" || phase === "elder";
  const saturnAdultLabel = saturnHouse ? SATURN_HOUSE_ADULT_STANDARD[saturnHouse] : undefined;
  const partnerVerb = isAdultLike ? "How to partner with this energy" : "How to support";
  const saturnBlock = saturnSign
    ? {
        sign: saturnSign,
        house: saturnHouse,
        struggle: SATURN_SACRED_STRUGGLE_BY_SIGN[saturnSign] ?? "trusting their own competence",
        howToSupport: isAdultLike && saturnAdultLabel
          ? `This is ${chart.name}'s ${saturnAdultLabel}. The work is not to outsource the standard to anyone else: it is to claim it as their own and stop asking for permission. When the old 'not enough' voice shows up here, name it as the audit it is, then keep going.`
          : saturnHouse && SATURN_HOUSE_SUPPORT[saturnHouse]
            ? `Protect ${SATURN_HOUSE_SUPPORT[saturnHouse]}. When ${chart.name} feels 'not enough' here, do not problem-solve first; just witness it out loud ("that sounds heavy, and you're not alone in it").`
            : `When ${chart.name} feels 'not enough' in this area, witness it out loud before trying to fix it.`,
        adultStandardLabel: isAdultLike ? saturnAdultLabel : undefined,
      }
    : undefined;

  const chironSign = Chiron?.sign;
  const chironHouse = houseOf(chart, Chiron);
  const chironTender = chironSign ? (CHIRON_TENDER_BY_SIGN[chironSign] ?? "a specific tender spot only they fully know") : "";
  const chironBlock = chironSign
    ? {
        sign: chironSign,
        house: chironHouse,
        tender: chironTender,
        howToSupport: isAdultLike
          ? `This is no longer a wound to manage: it is the credential ${chart.name} has earned the right to teach from. The thing they felt "less than" about in their twenties (${chironTender}) is exactly the territory they can now walk other people through. Stop protecting the scar. Show it on purpose.`
          : `When ${chart.name} bumps this wound, the antidote is never "you shouldn't feel that way." Name it: "I can see this is the sore spot. I am not going anywhere." Repair after rupture, every time.`,
      }
    : undefined;

  // === 3b. Chiron Return Spotlight (ages 45-52): Credentialing of the Wound
  let chironReturnSpotlight: ChildPortrait["chironReturnSpotlight"] = undefined;
  if (age != null && age >= 45 && age <= 52 && chironSign) {
    chironReturnSpotlight = {
      title: "The Credentialing of the Wound",
      body: `${chart.name} is inside the Chiron Return window (peaking around age 50). This is the soul of the reading right now. The exact thing they felt "less than" about in their twenties, ${chironTender} in ${chironSign}${chironHouse ? ` (${ordinal(chironHouse)} house)` : ""}, is being formally credentialed. The wound is not getting bigger; it is becoming the curriculum. What used to drain them is exactly what they are now qualified to teach, mentor, or hold space around. The job in this window is not more healing for themselves: it is letting other people benefit from the path they already walked.`,
    };
  }

  // === 4. How-To ==========================================================
  const ritualMoon = moonSign ? MOON_SAFETY_BY_SIGN[moonSign] : null;
  const ritualVenus = Venus?.sign ? VENUS_LOVE_BY_SIGN[Venus.sign] : null;
  const ritual = ritualMoon && ritualVenus
    ? `A daily 5-minute ritual: ${ritualMoon}. Weekly, layer in ${ritualVenus} as a love-deposit they actually register.`
    : ritualMoon
      ? `A daily 5-minute ritual: ${ritualMoon}.`
      : "A daily 5-minute ritual that respects their nervous system.";

  const learnLine = mercurySign ? MERCURY_LEARNING_BY_SIGN[mercurySign] : "their own pace and method";
  const paceLine = mercurySign && MERCURY_NERVOUS_SYSTEM_PACE[mercurySign]
    ? ` The 'why' under that: with ${mercurySign} Mercury, the nervous system is ${MERCURY_NERVOUS_SYSTEM_PACE[mercurySign]}.`
    : "";
  const rulerNudge = thirdRulerName ? ` Add: ${THIRD_HOUSE_RULER_NUDGE[thirdRulerName] ?? ""}.` : "";
  const learningStyle = `${chart.name} learns best ${learnLine}.${paceLine}${rulerNudge}`;

  const boundarySaturn = saturnSign ? SATURN_SACRED_STRUGGLE_BY_SIGN[saturnSign] : null;
  const boundaryMars = marsSign ? MARS_RESET_BY_SIGN[marsSign] : null;
  // Adult voice uses "Course correct" + Saturn-house Standard framing
  let boundary: string;
  if (isAdultLike) {
    const standardClause = saturnAdultLabel
      ? ` The boundary here is really a ${saturnAdultLabel}: ${chart.name} needs to know this territory is theirs to set, not anyone else's to approve.`
      : "";
    const marsClause = boundaryMars ? ` When the nervous system overheats, the reset is: ${boundaryMars}.` : "";
    const satClause = boundarySaturn ? ` Their inner Saturn is already busy ${boundarySaturn}, so harsh self-correction lands as "I am defective," not "I made a mistake."` : "";
    boundary = `Course correct, don't punish.${marsClause}${satClause}${standardClause}`.trim();
  } else {
    boundary = boundaryMars && boundarySaturn
      ? `Redirect, do not punish. ${chart.name}'s nervous system needs you to ${boundaryMars} before the boundary lands. Frame the limit as structure, not shame: their Saturn is already busy ${boundarySaturn}, so a harsh tone here registers as "I am defective," not "I made a mistake."`
      : boundaryMars
        ? `Redirect first: ${boundaryMars}. Then state the limit calmly as structure, not shame.`
        : "Redirect physically first; state the limit calmly as structure, not shame.";
  }


  // === 5. SYNTHESIS: Core Conflict (luminary in hard aspect to Saturn/Pluto/Uranus) ===
  let coreConflict: ChildPortrait["coreConflict"] = undefined;
  const HARD_OUTERS = ["Saturn", "Pluto", "Uranus"];
  const candidates: Array<{ luminary: "Sun" | "Moon"; luminarySign: string; outerPlanet: string; outerSign: string; aspect: AspectName; orb: number }> = [];
  for (const a of sunAspects) {
    if (HARD_ASPECTS.includes(a.aspect) && HARD_OUTERS.includes(a.to) && sunSign && planets[a.to]?.sign) {
      candidates.push({ luminary: "Sun", luminarySign: sunSign, outerPlanet: a.to, outerSign: planets[a.to]!.sign!, aspect: a.aspect, orb: a.orb });
    }
  }
  for (const a of moonAspects) {
    if (HARD_ASPECTS.includes(a.aspect) && HARD_OUTERS.includes(a.to) && moonSign && planets[a.to]?.sign) {
      candidates.push({ luminary: "Moon", luminarySign: moonSign, outerPlanet: a.to, outerSign: planets[a.to]!.sign!, aspect: a.aspect, orb: a.orb });
    }
  }
  candidates.sort((a, b) => a.orb - b.orb);
  if (candidates.length > 0) {
    const c = candidates[0];
    const lumFlavor = SIGN_FLAVOR_ADJ[c.luminarySign] ?? c.luminarySign;
    const audit = OUTER_AUDIT_VOICE[c.outerPlanet] ?? "an inner pressure";
    const fear = OUTER_FEAR_LINE[c.outerPlanet] ?? "afraid of getting it wrong";
    const luminaryNature = LUMINARY_NATURE_LINE[c.luminary];
    const aspectVerb = c.aspect === "opposition" ? "is in opposition to" : c.aspect === "square" ? "is squared by" : "is conjunct";
    const synthesis = `${chart.name}'s ${c.luminarySign} ${c.luminary} (${lumFlavor}) ${aspectVerb} ${c.outerPlanet} in ${c.outerSign} (orb ${c.orb.toFixed(1)}°). Because their ${luminaryNature} is constantly being audited by ${audit}, their natural ${lumFlavor} edge keeps getting second-guessed in real time. This is why they may seem distant, over-prepared, or "logical" when they are actually just ${fear}. The work is not to silence the ${c.outerPlanet}, but to let the ${c.luminarySign} ${c.luminary} lead first and have ${c.outerPlanet} edit second, instead of the other way around.`;
    coreConflict = { ...c, synthesis };
  }

  // === 6. SYNTHESIS: Hidden Engine (3rd house ruler) ======================
  let hiddenEngine: ChildPortrait["hiddenEngine"] = undefined;
  if (thirdCuspSign && thirdRulerName && thirdRulerSign) {
    const voice = THIRD_HOUSE_VOICE_TONE[thirdCuspSign] ?? "their own";
    const undercurrent = RULER_UNDERCURRENT_BY_SIGN[thirdRulerSign] ?? "a private undercurrent";
    const domain = thirdRulerHouse ? HOUSE_UNDERCURRENT_DOMAIN[thirdRulerHouse] : null;
    const domainClause = domain ? `, ${domain}` : "";
    const synthesis = `${chart.name} speaks the language of ${voice} (3rd-house cusp in ${thirdCuspSign}), but the actual engine driving their voice is ${thirdRulerName} in ${thirdRulerSign}${thirdRulerHouse ? ` in the ${ordinal(thirdRulerHouse)} house` : ""}. Underneath the surface tone there is ${undercurrent}${domainClause}. If ${chart.name} suddenly goes quiet or careful, they are not being passive: they are managing that undercurrent in real time so it doesn't leak out as too much.`;
    hiddenEngine = {
      thirdSign: thirdCuspSign,
      rulerName: thirdRulerName,
      rulerSign: thirdRulerSign,
      rulerHouse: thirdRulerHouse,
      synthesis,
    };
  }

  // === 7. SYNTHESIS: Shadow Guidance (South Node in 6/8/12) ===============
  let shadowGuidance: ChildPortrait["shadowGuidance"] = undefined;
  if (snHouse && HIDDEN_HOUSE_SHADOW[snHouse]) {
    shadowGuidance = { southHouse: snHouse, instruction: HIDDEN_HOUSE_SHADOW[snHouse] };
  }

  // === 8. View from the Bridge (only when viewer is older than subject) ===
  let viewFromBridge: ChildPortrait["viewFromBridge"] = undefined;
  if (
    viewerAge != null &&
    age != null &&
    viewerAge > age + 2 && // need a real generational gap, not a few months
    snSign && nnSign && snTired && nnCall
  ) {
    const chironClause = isAdultLike && chironSign
      ? ` You've also watched them carry ${chironTender} in ${chironSign}, and it has become a real part of how they read other people.`
      : "";
    const saturnClause = saturnSign
      ? ` Their inner Saturn keeps asking them to trust ${SATURN_SACRED_STRUGGLE_BY_SIGN[saturnSign] ?? "their own ground"}, and they are further along that road than they think.`
      : "";
    viewFromBridge = {
      body: `From where you are standing, the arc is visible: ${chart.name} started in the familiar ${snSign} groove of ${snTired}, and the whole life is bending them toward the ${nnSign} edge of ${nnCall}.${chironClause}${saturnClause} What looks like struggle from inside their head looks like genuine growth from the bridge you are standing on. Naming this out loud, once, in plain language, is one of the most useful things an elder can do.`,
    };
  }


  // === 9. Chart Ruler ("Captain of the Ship") =============================
  let chartRuler: ChildPortrait["chartRuler"] = undefined;
  if (ascSign) {
    const rulerName = TRADITIONAL_RULERS[ascSign];
    const rulerPlanet = rulerName ? planets[rulerName] : undefined;
    if (rulerName && rulerPlanet?.sign) {
      const rulerHouse = houseOf(chart, rulerPlanet);
      const flavor = SIGN_FLAVOR_ADJ[rulerPlanet.sign] ?? rulerPlanet.sign;
      const domain = rulerHouse ? HOUSE_THEME[rulerHouse] : null;
      const minorFrame = phase === "child"
        ? "the engine they are practicing steering"
        : "the engine driving the whole ship";
      const line = `With ${ascSign} Rising, the Captain of the Ship is ${rulerName}. ${rulerName} is hanging out in ${rulerPlanet.sign}${rulerHouse ? ` in the ${ordinal(rulerHouse)} house` : ""}, which means ${chart.name}'s primary motivation runs through ${flavor} energy${domain ? `, channeled into ${domain}` : ""}. That is ${minorFrame}: the rest of the chart is the crew, but this is the one giving the orders.`;
      chartRuler = { rulerName, rulerSign: rulerPlanet.sign, rulerHouse, ascSign, line };
    }
  }

  // === 10. Tightest Planetary Conversations ===============================
  // Prioritize tightest Sun/Moon aspects, then translate to behavioral language.
  const seenPair = new Set<string>();
  const luminaryConversations: Array<{ a: string; b: string; aspect: AspectName; orb: number; quality: "hard" | "soft"; line: string }> = [];
  const pushAspect = (aFrom: "Sun" | "Moon", to: string, aspect: AspectName, orb: number) => {
    const key = aspectConversationKey(aFrom, to);
    if (seenPair.has(key)) return;
    const lookup = ASPECT_CONVERSATION[key];
    if (!lookup) return;
    const quality: "hard" | "soft" = HARD_ASPECTS.includes(aspect) ? "hard" : "soft";
    const text = quality === "hard" ? lookup.hard : lookup.soft;
    const aspectLabel = quality === "hard" ? "in tension with" : "in flow with";
    const aSign = aFrom === "Sun" ? sunSign : moonSign;
    const bSign = planets[to]?.sign;
    const minorFrame = phase === "child"
      ? "This is a developmental edge they are practicing, not a flaw."
      : "";
    const line = `${aSign ? `${aSign} ` : ""}${aFrom} ${aspectLabel} ${bSign ? `${bSign} ` : ""}${to} (${aspect}, orb ${orb.toFixed(1)}°): ${text}.${minorFrame ? ` ${minorFrame}` : ""}`;
    luminaryConversations.push({ a: aFrom, b: to, aspect, orb, quality, line });
    seenPair.add(key);
  };
  // Walk tightest-first across both luminaries
  const combined: Array<{ from: "Sun" | "Moon"; to: string; aspect: AspectName; orb: number }> = [
    ...sunAspects.map(s => ({ from: "Sun" as const, to: s.to, aspect: s.aspect, orb: s.orb })),
    ...moonAspects.map(m => ({ from: "Moon" as const, to: m.to, aspect: m.aspect, orb: m.orb })),
  ].sort((a, b) => a.orb - b.orb);
  for (const c of combined) {
    if (luminaryConversations.length >= 3) break;
    pushAspect(c.from, c.to, c.aspect, c.orb);
  }
  const tightestAspects = luminaryConversations.length > 0 ? luminaryConversations : undefined;

  return {

    name: chart.name,
    age,
    birthDate: chart.birthDate,
    lifePhase: lifePhaseFor(age),

    developmentalAnchor: { stage, focus, body, extraHolding },
    coreConflict,
    hiddenEngine,
    shadowGuidance,
    identityInvitation: {
      rising: ascSign ? { sign: ascSign, line: risingLine } : undefined,
      sun: sunSign ? { sign: sunSign, house: sunHouse, line: sunLine } : undefined,
      northNode: nnSign ? { sign: nnSign, house: nnHouse, line: nnLineFinal } : undefined,
      southNode: snSign ? { sign: snSign, house: snHouse, line: snLine } : undefined,
      tradeLine,
    },
    masterySpot: {
      saturn: saturnBlock,
      chiron: chironBlock,
    },
    chironReturnSpotlight,
    viewFromBridge,
    howTo: { ritual, learningStyle, boundary },
    mathCheck: {
      thirdHouseSign: thirdCuspSign,
      thirdHouseRuler: thirdRulerName,
      thirdHouseRulerSign: thirdRulerSign,
      thirdHouseRulerHouse: thirdRulerHouse,
      sunAspects: sunAspects.slice(0, 6),
      moonAspects: moonAspects.slice(0, 6),
    },
  };
}


