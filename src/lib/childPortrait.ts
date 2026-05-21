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
  const min = typeof (p as any).minutes === "number" ? (p as any).minutes : 0;
  return idx * 30 + deg + min / 60;
}

function cuspAbs(c?: { sign: string; degree?: number; minutes?: number }): number | null {
  if (!c?.sign) return null;
  const idx = SIGNS.indexOf(c.sign);
  if (idx < 0) return null;
  return idx * 30 + (c.degree ?? 0) + ((c.minutes ?? 0) / 60);
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

// Sun-sign "what they are practicing" lines.
// Phrased as nervous-system intent, never as banned keywords
// ("people-pleasing," "difficult," "dreamer," "weird," "scattered," "moody").
const SUN_PRACTICE_BY_SIGN: Record<string, string> = {
  Aries: "practicing courage; the nervous system fires before it gets boxed in, which keeps initiative online",
  Taurus: "practicing steady self-worth; the nervous system slows to protect against being rushed or destabilized",
  Gemini: "practicing curiosity and honest voice; the nervous system stays alert by sampling many inputs at once",
  Cancer: "practicing tender leadership; the nervous system tracks the room's feeling state to keep the bond safe",
  Leo: "practicing generous visibility; the nervous system needs warm reflection back to confirm it is welcome",
  Virgo: "practicing useful precision; the nervous system steadies by finding the next small competent action",
  Libra: "practicing fair self-advocacy; the nervous system reads disharmony as physical danger and smooths the room pre-emptively",
  Scorpio: "practicing honest intensity; the nervous system keeps the real story private until trust is proven",
  Sagittarius: "practicing meaning and honesty; the nervous system bolts the moment things feel small or untrue",
  Capricorn: "practicing earned authority; the nervous system uses structure to convert pressure into capability",
  Aquarius: "practicing original perspective; the nervous system refuses groupthink to keep its own signal clean",
  Pisces: "practicing compassion with edges; the nervous system absorbs the room and needs edges to prevent flooding",
};

// Plain-English one-liners used in the adult-anchor body so the reader gets
// a direct definition instead of a metaphor. "What this placement actually
// means in normal words."
const SUN_PLAIN_BY_SIGN: Record<string, string> = {
  Aries: "wired to start things and move first; needs action to feel like themselves",
  Taurus: "wired for steadiness, comfort, and building things that last",
  Gemini: "wired to ask questions, talk, and connect ideas",
  Cancer: "wired to care for people and to track the emotional weather of whoever is in the room with them",
  Leo: "wired to be seen warmly and to express themselves out loud",
  Virgo: "wired to be useful, to notice details, and to make things work better",
  Libra: "wired to keep things fair and to think about themselves and the other person at the same time",
  Scorpio: "wired for depth, privacy, and the real story underneath",
  Sagittarius: "wired for honesty, freedom, and the bigger meaning of things",
  Capricorn: "wired to build authority and to earn what they have",
  Aquarius: "wired to think for themselves and stand a little outside the group",
  Pisces: "wired for empathy, imagination, and absorbing the mood of the room",
};

// Describes WHERE this core wiring shows up in real life. Each line must
// stand alone in plain English with no astrology jargon and no vague pronouns.
const SUN_HOUSE_PLAIN: Record<number, string> = {
  1: "Other people pick this up in the first 30 seconds of meeting them. It is in their face, their body language, the way they enter a room, and the impression they leave.",
  2: "This wiring runs their relationship with money, their body, food, and what they consider valuable. You see who they are by watching what they spend on, what they refuse to spend on, and what they treat as worth keeping.",
  3: "This wiring shows up in how they talk, text, learn, and move through an ordinary day. Siblings, neighbors, short trips, and the way they explain things are where it lives.",
  4: "This wiring is most itself at home and with family. The public version can look different. The real version comes out behind closed doors, with the people they live with, and in the place they call home.",
  5: "This wiring shows up in what they make, what they play at, who they flirt with, and how they parent or create. Hobbies, art, romance, and kids are where the core self comes out to play.",
  6: "This wiring runs their daily routine, their job tasks, their health habits, and the small useful things they do every day. You see who they are in how they handle the to-do list.",
  7: "This wiring shows up most clearly through one-on-one relationships. Their partner, their best friend, and their close clients reflect the core self back at them. They figure out who they are by who they pair up with.",
  8: "This wiring shows up around shared money, intimacy, debt, inheritance, therapy, and the topics most people skirt in casual conversation. The real self lives in the private, high-stakes conversations.",
  9: "This wiring shows up through travel, big beliefs, teaching, publishing, and the search for meaning. Long trips and the question 'what is this all for' are where the core self lives.",
  10: "This wiring shows up in their public role, their career, and what strangers know them for. The job title, the reputation, and the work they put their name on all carry the core self.",
  11: "This wiring shows up through friend groups, communities, causes, and the long-term future they are building with other people. The chosen tribe is where the core self lives.",
  12: "This wiring shows up quietly and behind the scenes. Dreams, solitude, spiritual practice, and the inner life are where the real self lives. Other people often miss it because it is not on display.",
};

// What Jupiter in this sign gives the person expertise in / language for.
const JUPITER_TEACHES_BY_SIGN: Record<string, string> = {
  Aries: "courage, starting from scratch, and how to act on instinct",
  Taurus: "money, body, food, and how to build real-world resources that last",
  Gemini: "communication, writing, and how to connect ideas and people",
  Cancer: "family, home, emotional safety, and how to take care of people",
  Leo: "creative expression, leadership, and how to show up generously",
  Virgo: "skill, craft, health routines, and how to make things actually work",
  Libra: "relationships, fairness, design, and how to hold two sides at once",
  Scorpio: "trust, intimacy, money others share, and how to face hard truths",
  Sagittarius: "teaching, travel, big-picture meaning, and how to find honest direction",
  Capricorn: "building authority, long-term plans, and how to earn lasting respect",
  Aquarius: "innovation, community, and how to build something new with a group",
  Pisces: "compassion, imagination, art, and how to hold pain without breaking",
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

// Communication scripts by Saturn sign. These are the *how to say it* phrases
// used in the Personal Standards / Boundary section. They translate the inner
// Saturn theme into a concrete sentence a parent or partner can actually use,
// so the section is a Communication Strategy, not a restatement of the
// Mastery Spot text.
const SATURN_COMMUNICATION_SCRIPT: Record<string, { opener: string; avoid: string }> = {
  Aries:       { opener: "\"You don't have to get it right on the first try, just start, and we'll adjust together.\"", avoid: "rushing them or calling them slow to act" },
  Taurus:      { opener: "\"You have enough, and you are enough. Take the time you need.\"",                              avoid: "implying they're being greedy, stingy, or stuck" },
  Gemini:      { opener: "\"Say it however it comes out, I'll meet you in the middle.\"",                                avoid: "correcting their words mid-sentence" },
  Cancer:      { opener: "\"Being soft here is safe. I'm not going anywhere.\"",                                          avoid: "calling them too sensitive or dramatic" },
  Leo:         { opener: "\"I see you, and being seen here won't cost you anything.\"",                                   avoid: "shaming them in front of other people" },
  Virgo:       { opener: "\"This is already good enough. We're not graded on this.\"",                                    avoid: "pointing out the one small thing they missed" },
  Libra:       { opener: "\"We can disagree on this and still be okay.\"",                                                avoid: "framing your difference as proof the bond is breaking" },
  Scorpio:     { opener: "\"You can tell me the real version. I can handle it.\"",                                        avoid: "asking layered or interrogating questions" },
  Sagittarius: { opener: "\"Your read on this counts. What does it look like from where you're standing?\"",              avoid: "telling them their meaning of it is wrong" },
  Capricorn:   { opener: "\"You don't have to earn this with output. The standard is yours to set.\"",                    avoid: "tying your approval to what they produced" },
  Aquarius:    { opener: "\"You don't have to fit in here to belong here.\"",                                             avoid: "guilt-tripping them into 'joining in'" },
  Pisces:      { opener: "\"No is a complete sentence, you don't have to explain it.\"",                                 avoid: "pressuring them to justify a soft refusal" },
};

const SATURN_HOUSE_SUPPORT: Record<number, string> = {
  1: "their identity and physical presence, never tease their body or how they show up; affirm 'you get to take up space'",
  2: "their sense of worth and material safety, affirm 'you are enough as you are, with what you have'",
  3: "their voice and learning, never correct their words in public; let them finish their sentence",
  4: "their sense of home and belonging, make 'home' explicitly unconditional out loud, repeatedly",
  5: "their right to play and create, never criticize their creative output; celebrate the act, not the product",
  6: "their daily competence and body, never compare their pace to a sibling's; affirm small wins",
  7: "their experience of being chosen, be visibly delighted by their company without conditions",
  8: "their right to privacy and depth, never read their journal or pry; let them come to you",
  9: "their right to their own meaning and beliefs, let them disagree without being corrected",
  10: "their public reputation, never publicly shame them; success-pressure lands sideways",
  11: "their right to belong with peers, protect their friendships and group time",
  12: "their need for genuine alone-time, protect their rest and inner world",
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


// The actual core wound for each Chiron sign. Phrased as the lifelong tender
// territory the person keeps bumping into, not a single feeling or a
// physical stereotype.
const CHIRON_TENDER_BY_SIGN: Record<string, string> = {
  Aries: "having to fight for the right to exist as themselves: going first, taking up space, getting angry, asserting 'I want this' without apologizing or shrinking",
  Taurus: "self-worth tied to what they have, what they earn, and what their body can produce: the quiet question of whether they are 'enough' on their own, with no proof attached",
  Gemini: "their voice and their mind being taken seriously: being interrupted, mis-quoted, talked over, or treated as 'just' clever instead of actually believed",
  Cancer: "belonging and being mothered: never quite sure if they were truly welcome, wanted, or safe to need things from the people supposed to take care of them",
  Leo: "being loved for who they actually are versus what they perform: the fear that the real them is not interesting enough without the show",
  Virgo: "never doing it right or being clean/healthy/competent enough: a private feeling that something about them or their body is broken and needs fixing",
  Libra: "knowing who they are inside a relationship: losing themselves to keep the peace, or feeling unchosen and unable to disappoint anyone",
  Scorpio: "trust, power, and what gets done to them in private: betrayal, control, intimacy, and the question of who actually has the power in any close bond",
  Sagittarius: "meaning and faith: a hunger for a 'true north' to believe in, and the ache when teachers, beliefs, or systems they trusted turn out to be hollow",
  Capricorn: "authority and being taken seriously: father-stuff, legitimacy, the right to be in charge, and the fear of being exposed as not qualified",
  Aquarius: "belonging to the group while still being themselves: the lifelong gap between wanting to be part of something and feeling like the odd one out in it",
  Pisces: "where they end and other people begin: absorbing other people's pain, getting cast as the saint or the scapegoat, and losing track of what is actually theirs",
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

// Mercury sign → Cognitive Profile (HOW the mind actually processes information).
// label = the operating system name. processing = how data is taken in.
// blocker = what makes the brain reject input. application = a real-world "so what."
const MERCURY_COGNITIVE_PROFILE: Record<string, {
  label: string;
  processing: string;
  blocker: string;
  application: string;
}> = {
  Aries: {
    label: "Sprint Processor",
    processing: "thinks in bursts and decides while moving; the body figures it out before the head finishes the sentence",
    blocker: "long preambles and slow group discussion shut the engine down",
    application: "don't ask for a five-step plan; give one live problem to attack and let the strategy emerge while solving it",
  },
  Taurus: {
    label: "Tactile Processor",
    processing: "thinks by handling the thing; comprehension lives in the hands and the senses, not in abstract description",
    blocker: "rapid verbal instructions with no object, demo, or pace; rushing erases retention",
    application: "for any new skill, give the physical object and a slow demonstration; words come after the hands already understand",
  },
  Gemini: {
    label: "Parallel Processor",
    processing: "thinks by connecting many small pieces in real time, mid-conversation; the mouth and the mind run at the same speed",
    blocker: "being told to 'just listen'; without talk-back the data evaporates",
    application: "for any concept, ask them to teach it back immediately in their own words; that is when it actually locks in",
  },
  Cancer: {
    label: "Emotional-Context Processor",
    processing: "thinks through felt meaning; needs to know who is involved and why it matters before the facts can land",
    blocker: "cold lists, anonymous data, or pressure with no emotional frame",
    application: "wrap any teaching in a short personal story; the facts ride in on the feeling, not the other way around",
  },
  Leo: {
    label: "Performance Processor",
    processing: "thinks by demonstrating; the wiring locks in when they get to show what they know, ideally to a real audience",
    blocker: "silent solo drill with no audience or reflection back",
    application: "let them be 'the one explaining it'; teaching a younger sibling, a peer, or a camera is their fastest path to mastery",
  },
  Virgo: {
    label: "Procedural Processor",
    processing: "thinks in step-by-step sequences; safety comes from a clean, written, ordered method they can follow and verify",
    blocker: "vague open-ended prompts and 'just figure it out' freezes them",
    application: "give the exact method on paper, then ask them to refine it; they will hand you back a cleaner version",
  },
  Libra: {
    label: "Comparative Processor",
    processing: "thinks by weighing options out loud with a partner; clarity comes through dialogue, not solo reflection",
    blocker: "being forced to commit before the comparison conversation has happened",
    application: "for any decision, set up a real back-and-forth ('here are the two options, walk me through them'); the answer shows up mid-sentence",
  },
  Scorpio: {
    label: "Depth Processor",
    processing: "thinks by going all the way into one thing; surface coverage of many topics feels meaningless and gets discarded",
    blocker: "interruption, rotation between subjects, or being kept on the surface",
    application: "let them obsess on one project, deeply, for an unusual length of time; that intensity is the learning, not a problem to manage",
  },
  Sagittarius: {
    label: "Meaning-First Processor",
    processing: "thinks from the big picture down; needs the philosophical 'why this matters' before any detail will register",
    blocker: "drilling on rules or details before the larger purpose is named",
    application: "before any chore, lesson, or correction, name the bigger principle in one sentence; the specifics then click into place",
  },
  Capricorn: {
    label: "Long-Arc Processor",
    processing: "thinks in milestones and earned progress; needs to see the staircase before they will take the first step",
    blocker: "open-ended exploration with no visible structure or finish line",
    application: "map a clear sequence with checkpoints; their motivation runs on seeing the climb laid out, not on a vague 'do your best'",
  },
  Aquarius: {
    label: "Systems Architect (Lateral Thinker)",
    processing: "thinks by mapping the entire system before touching any single part, and routinely solves problems by importing solutions from completely unrelated fields",
    blocker: "rote repetition and 'because I said so' rules; without the big-picture purpose, the details register as noise",
    application: "for a stuck family or school issue, hand them the 'goal of the kitchen' or the 'goal of the project' and let them design the process. Expect the solution to arrive sideways, borrowed from a documentary, a game, or a business they've been reading about",
  },
  Pisces: {
    label: "Osmotic / Image Processor",
    processing: "learns through atmosphere, image, music, and metaphor; absorbs by being in the room more than by being directly instructed",
    blocker: "logic-heavy lists, dense bullet points, or harsh fluorescent direct instruction will actively clog the intake",
    application: "give a story, an image, or a piece of music alongside the lesson; skip the bullet list. They will recall the feeling and the picture, and the content rides in attached to it",
  },
};

// 3rd house cusp → information-intake style modifier (layered on top of Mercury profile)
const THIRD_HOUSE_CUSP_INTAKE: Record<string, string> = {
  Aries: "Information has to arrive with stakes and momentum, or the brain treats it as filler",
  Taurus: "Information lands best when delivered slowly, in one calm voice, with no time pressure",
  Gemini: "Information needs to be conversational and two-way; one-way lectures bounce off",
  Cancer: "Information needs to come from a person they trust emotionally, not a cold authority",
  Leo: "Information lands when it is delivered with warmth and confidence, never with sarcasm or shame",
  Virgo: "Information needs to be precise and accurate; a single careless error costs you their trust in the whole lesson",
  Libra: "Information lands when it is framed as fair and balanced, with both sides shown",
  Scorpio: "Information has to feel real and unfiltered; sanitized or performative delivery is rejected",
  Sagittarius: "Information lands when the 'big idea' and the honest truth are named up front",
  Capricorn: "Information needs structure, a clear chain of command, and a visible reason it counts",
  Aquarius: "Information lands when they are treated as a peer in the conversation, never talked down to",
  Pisces: "Information needs softness and imagery; harsh, blunt delivery scrambles the signal",
};

const THIRD_HOUSE_RULER_NUDGE: Record<string, string> = {
  Sun: "they learn best when their effort is visibly seen",
  Moon: "they learn best when they feel safe and unrushed",
  Mercury: "they learn best by talking the idea back at you",
  Venus: "they learn best when the material is beautiful or relational",
  Mars: "they learn best with stakes, challenge, and movement",
  Jupiter: "they learn best when the big-picture 'why' is named first",
  Saturn: "they learn best with structure, milestones, and clear standards",
  Uranus: "they learn best by importing solutions from unrelated fields, not by following the standard sequence",
  Neptune: "they learn best through story, image, and absorbed mood",
  Pluto: "they learn best by going deep on one thing at a time",
};

// ── Rising-Filter Synthesis (Chart Ruler "Boss of the Chart") ───────────────
// Each rising sign carries a stereotype that gets weaponized into "keyword astrology."
// We name the stereotype only to ban it, then describe the actual nervous-system intent.
const RISING_FILTER: Record<string, { stereotype: string; verb: string; surfaceJob: string }> = {
  Aries: { stereotype: "aggressive", verb: "lead with directness", surfaceJob: "test the room for who can hold their pace" },
  Taurus: { stereotype: "stubborn", verb: "use a slow, grounded body", surfaceJob: "set the room's pace before anyone can rush them" },
  Gemini: { stereotype: "scattered", verb: "use quick conversation and questions", surfaceJob: "scan for the room's actual position before committing" },
  Cancer: { stereotype: "moody", verb: "use emotional reading", surfaceJob: "check whether it is safe to soften" },
  Leo: { stereotype: "showy", verb: "lead with warmth and presence", surfaceJob: "create a stage worth being met on" },
  Virgo: { stereotype: "picky", verb: "use careful precision", surfaceJob: "remove friction before it can hurt anyone" },
  Libra: { stereotype: "nice or people-pleasing", verb: "use diplomacy and harmonizing", surfaceJob: "lower the temperature so the real talk can happen" },
  Scorpio: { stereotype: "intense", verb: "use a quiet, watching presence", surfaceJob: "wait for the room to reveal who is actually safe" },
  Sagittarius: { stereotype: "blunt", verb: "use big-picture honesty", surfaceJob: "test whether the room can hold the real truth" },
  Capricorn: { stereotype: "cold", verb: "use structured authority", surfaceJob: "establish who is responsible for what before warmth arrives" },
  Aquarius: { stereotype: "weird", verb: "use cool objectivity", surfaceJob: "stay one step outside the group in order to see it clearly" },
  Pisces: { stereotype: "dreamy", verb: "use a soft, permeable presence", surfaceJob: "let the room's mood enter so it can be read from the inside" },
};

// ── Rising Scanner: physical "what does this sign scan a room for" + mask label + safety payoff
// Used by the Identity Invitation Filter section to follow the Scanner / Boss / Synthesis / Why template.
const RISING_SCANNER: Record<string, { mask: string; scanFor: string; safety: string }> = {
  Aries:       { mask: "Starter",         scanFor: "Who's in charge here? Where's the first move?",            safety: "moving first so no one can pin them in place" },
  Taurus:      { mask: "Anchor",          scanFor: "What feels solid? What's about to get rushed?",            safety: "setting the pace so nothing can shove their body" },
  Gemini:      { mask: "Reporter",        scanFor: "What's the story? Who's actually saying what?",            safety: "gathering options before anyone locks them into one" },
  Cancer:      { mask: "Caretaker",       scanFor: "Who is safe? Who is hurting in the room?",                 safety: "reading the emotional weather before they expose their own" },
  Leo:         { mask: "Performer",       scanFor: "Where is the warmth? Who is actually looking?",            safety: "controlling how they get seen instead of being caught off-guard" },
  Virgo:       { mask: "Editor",          scanFor: "What is out of place? What's about to break?",             safety: "fixing the small thing first so the big thing can't blindside them" },
  Libra:       { mask: "Diplomat",        scanFor: "Who's uncomfortable? Where's the imbalance in the room?",  safety: "smoothing the surface so no one turns hostile toward them" },
  Scorpio:     { mask: "X-Ray",           scanFor: "What is the real story underneath what people are saying?", safety: "knowing the truth before anyone can use it against them" },
  Sagittarius: { mask: "Explorer",        scanFor: "Where's the exit? Where's the bigger story?",              safety: "keeping a door open so they never feel cornered" },
  Capricorn:   { mask: "Manager",         scanFor: "Who's in charge here? What are the rules?",                safety: "knowing the structure before they have to play inside it" },
  Aquarius:    { mask: "Outsider",        scanFor: "What is the group missing? Where can I stand outside this?", safety: "staying one step outside the group so it can't absorb them" },
  Pisces:      { mask: "Sponge",          scanFor: "What is the mood in this room? Who is hurting?",           safety: "absorbing the room first so nothing surprises their nervous system" },
};

// ── Kitchen-at-8AM Behavior: what the Rising mask + Ruler combo literally looks like in the room.
// Keyed by Rising sign. Concrete, observable behavior, no astro-nouns.
const RISING_KITCHEN_BEHAVIOR: Record<string, string> = {
  Aries:       "they walk in already moving, already deciding what's for breakfast before anyone else is awake",
  Taurus:      "they refuse to be rushed out the door, the body sets the pace and the schedule has to bend",
  Gemini:      "they're already mid-sentence about three different things before their feet hit the kitchen floor",
  Cancer:      "they read the face of whoever walked in first to check what kind of morning this is going to be",
  Leo:         "they need a warm hello and eye contact, or the whole day reads as cold",
  Virgo:       "they spot the one thing out of place, the crumbs, the wrong mug, and can't unsee it",
  Libra:       "they smooth the first tension in the room before they've even sat down",
  Scorpio:     "they go quiet and watch, reading who is actually safe to talk to first",
  Sagittarius: "they're already half out the door, talking about the trip, the plan, anything past this kitchen",
  Capricorn:   "they want to know the plan for the day before they'll fully arrive in the morning",
  Aquarius:    "they stand slightly apart, observing the family as if from outside it",
  Pisces:      "they feel the loud music, the bright light, the leftover tension from last night, all of it at once",
};

// ── Elder/parent advice per Rising mask, what NOT to do at 8 AM.
const RISING_ELDER_ADVICE: Record<string, string> = {
  Aries:       "Don't tell them to slow down, give them the first job of the morning so the energy has a target.",
  Taurus:      "Don't rush the body. Give a 10-minute warning, not a 'we leave now.'",
  Gemini:      "Don't shut down the chatter. Ask one real question and the wiring lands.",
  Cancer:      "Don't perform 'fine' over a tense morning, they read the room either way. Name it briefly.",
  Leo:         "Don't skip the greeting. A warm hello costs nothing and changes the day.",
  Virgo:       "Don't call them picky. They are flooded by the out-of-place thing, fix it or name it, then move on.",
  Libra:       "Don't ask them to take a side at breakfast. Let them have neutral ground until they're warmed up.",
  Scorpio:     "Don't push for a chipper morning report. Quiet is how they warm up, not a problem to fix.",
  Sagittarius: "Don't pin them down to the table. Keep one door symbolically open, talk about later in the day.",
  Capricorn:   "Don't drop them into chaos. A two-sentence map of the day lets the nervous system settle.",
  Aquarius:    "Don't demand warmth on cue. Let them observe; warmth comes once they're not being watched.",
  Pisces:      "Don't tell them to toughen up. Lower the music, dim the light, give them five quiet minutes to dock.",
};

const RISING_FALSE_STORY: Record<string, string> = {
  Aries:       "being pushy",
  Taurus:      "being lazy or stubborn",
  Gemini:      "being scattered",
  Cancer:      "being moody",
  Leo:         "being showy",
  Virgo:       "being picky",
  Libra:       "being nice to be liked",
  Scorpio:     "being intense or cold",
  Sagittarius: "being flaky",
  Capricorn:   "being cold or rigid",
  Aquarius:    "being aloof or weird",
  Pisces:      "being dreamy or dramatic",
};


// What the chart-ruler's SIGN is actually defending or pursuing (the deep aim).
const RULER_SIGN_DRIVE: Record<string, string> = {
  Aries: "their own initiative and the freedom to move first",
  Taurus: "bodily steadiness and the right to set their own pace",
  Gemini: "options, information, and the freedom to change their mind",
  Cancer: "emotional belonging and the safety of the inner circle",
  Leo: "being seen warmly and on their own terms",
  Virgo: "competence, order, and the right to refine",
  Libra: "fair partnership and a balanced field",
  Scorpio: "depth, privacy, and emotional truth",
  Sagittarius: "freedom, an open exit, and a story large enough to live inside",
  Capricorn: "earned respect and long-arc mastery",
  Aquarius: "personal independence and the integrity of their own signal",
  Pisces: "rest, dissolution, and an unfenced inner world",
};

// ── Node-House Synthesis (comfort of / edge of) ─────────────────────────────
// South Node house = comfort. North Node house = the edge where life actually is.
const HOUSE_COMFORT: Record<number, string> = {
  1: "the comfort of staying at the surface presentation and not letting people past it to the inner self",
  2: "the comfort of accumulating, holding, and not letting anything be moved",
  3: "the comfort of staying in motion in the conversation so it rarely lands on them",
  4: "the comfort of the home cave and the inner circle",
  5: "the comfort of being the one who is watched and applauded",
  6: "the comfort of being the one who fixes and tends",
  7: "the comfort of the we, of over-stabilizing the relationship",
  8: "the comfort of staying private and controlling the depth-level",
  9: "the comfort of the big idea and the meaning, far away from the mundane",
  10: "the comfort of the public role and the title",
  11: "the comfort of the group, the cause, and being one of many",
  12: "the comfort of disappearing and processing in private",
};
const HOUSE_EDGE: Record<number, string> = {
  1: "the intensity of the me, claiming a body, a face, and a pulse in the room",
  2: "the edge of pure self-worth without the props",
  3: "the edge of listening for the real signal and saying the actual sentence",
  4: "the edge of being seen and rooted in the world, not just at home",
  5: "the edge of co-creating with one specific other person instead of an audience",
  6: "the edge of resting the body and trusting that nothing breaks",
  7: "the intensity of the me, taking a clear position even if it costs the we",
  8: "the edge of merging, sharing power, and letting another in fully",
  9: "the edge of the small mundane detail and the practical daily craft",
  10: "the edge of the private inner life beneath the public role",
  11: "the edge of the one specific bond instead of the group",
  12: "the edge of being witnessed in plain view",
};

// ── Moon Phase Profile (Sun–Moon angular distance) ──────────────────────────
// Phase = (moonLon − sunLon) mod 360. Eight phases, 45° each.
// We give each phase a behavioral profile, with explicit Composter/Finisher
// framing for Balsamic so AI never tells them to "initiate" or "start."
export type MoonPhaseName =
  | "New" | "Crescent" | "First Quarter" | "Gibbous"
  | "Full" | "Disseminating" | "Last Quarter" | "Balsamic";

const MOON_PHASE_PROFILE: Record<MoonPhaseName, { label: string; instinct: string; banTold: string; trueWork: string }> = {
  New: {
    label: "Seed / Instinct",
    instinct: "acts on raw instinct before they can fully explain why",
    banTold: "Don't tell them to 'plan it first', that kills the seed",
    trueWork: "Their work is to trust the impulse and start unpolished",
  },
  Crescent: {
    label: "Builder of the New Thing",
    instinct: "feels resistance from the old world and has to push the seed forward against it",
    banTold: "Don't tell them they're 'difficult' for resisting; they are protecting an emerging thing",
    trueWork: "Their work is to keep moving the seed even when the field pushes back",
  },
  "First Quarter": {
    label: "Crisis-in-Action",
    instinct: "thrives when a problem demands a decision and a move right now",
    banTold: "Don't tell them to 'wait and see'",
    trueWork: "Their work is to use friction as fuel and make the call",
  },
  Gibbous: {
    label: "Refiner / Perfecter",
    instinct: "edits, adjusts, and pressure-tests almost obsessively before reveal",
    banTold: "Don't tell them they are 'picky', the refinement IS the contribution",
    trueWork: "Their work is to perfect the offering before sharing it",
  },
  Full: {
    label: "Illuminator / Revealer",
    instinct: "sees both sides at once and is built to make things visible",
    banTold: "Don't tell them to 'pick a side' prematurely",
    trueWork: "Their work is to hold the tension long enough for clarity to arrive, then reveal",
  },
  Disseminating: {
    label: "Teacher / Translator",
    instinct: "naturally translates what they have lived into something others can use",
    banTold: "Don't tell them they 'talk too much'",
    trueWork: "Their work is to give it away in language other people can hold",
  },
  "Last Quarter": {
    label: "Revolutionary / Reformer",
    instinct: "sees what no longer works and dismantles it from the inside",
    banTold: "Don't tell them they are 'negative' for naming what is broken",
    trueWork: "Their work is to dismantle the outgrown structure on purpose",
  },
  Balsamic: {
    label: "Composter / Finisher",
    instinct: "is built to release, integrate, and complete cycles, not to start new ones from scratch",
    banTold: "Stop telling them to 'initiate,' 'launch,' or 'manifest.' That framing makes them feel broken",
    trueWork: "Their power lives in letting go on purpose, finishing what is unfinished, and quietly preparing the soil for the next cycle. Endings are their genius, not their failure",
  },
};

function computeMoonPhase(sunLon: number, moonLon: number): { phase: MoonPhaseName; angle: number } {
  const angle = ((moonLon - sunLon) % 360 + 360) % 360;
  if (angle < 45) return { phase: "New", angle };
  if (angle < 90) return { phase: "Crescent", angle };
  if (angle < 135) return { phase: "First Quarter", angle };
  if (angle < 180) return { phase: "Gibbous", angle };
  if (angle < 225) return { phase: "Full", angle };
  if (angle < 270) return { phase: "Disseminating", angle };
  if (angle < 315) return { phase: "Last Quarter", angle };
  return { phase: "Balsamic", angle };
}

// ── Synthesis libraries: "the why behind the what" ───────────────────────────
// Used parenthetically after a Sun/Moon sign to add concrete behavior, not
// adjective soup. Each entry must describe something observable.
const SIGN_FLAVOR_ADJ: Record<string, string> = {
  Aries: "moves first and asks questions later, will start the project before the plan exists",
  Taurus: "sets their own pace, will not be rushed, builds in long quiet stretches",
  Gemini: "thinks out loud, runs several conversations at once, changes their mind in public",
  Cancer: "tracks the emotional weather of the room and adjusts before anyone names what shifted",
  Leo: "warms up the room when they walk in, needs to be greeted by name",
  Virgo: "notices what is out of place, fixes the small broken thing, refines the method as they go",
  Libra: "weighs both sides out loud, lowers the temperature before having the real conversation",
  Scorpio: "stays quiet and watches first, then says the thing nobody else will say",
  Sagittarius: "names the bigger picture, keeps an exit visible, says the honest sentence",
  Capricorn: "wants the plan and the timeline, takes the long way on purpose, earns it",
  Aquarius: "stands a half-step outside the group, watches the system, refuses to copy the script",
  Pisces: "absorbs the mood in the room, answers in image and feeling more than bullet points",
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

// Inserted into "Underneath the surface tone there is ${undercurrent}".
// Must read as a felt, concrete pressure, not adjective fog.
const RULER_UNDERCURRENT_BY_SIGN: Record<string, string> = {
  Aries: "a push to act, decide, and move before they have finished thinking",
  Taurus: "a quiet refusal to be rushed, the body setting the pace from underneath",
  Gemini: "a fast feed of half-finished thoughts looking for somewhere to land",
  Cancer: "a soft scan for who is safe and who is hurting in the room",
  Leo: "a steady check for whether they are actually being seen and met",
  Virgo: "a running mental edit, fixing and sequencing in the background",
  Libra: "a constant weighing of how this is landing on the other person",
  Scorpio: "a watchful pressure, holding the truth back until the room earns it",
  Sagittarius: "a pull toward the exit, the bigger story, anywhere with more air",
  Capricorn: "a serious tracking of who is responsible for what and what comes next",
  Aquarius: "a half-step backwards out of the group so they can see the whole shape of it",
  Pisces: "an absorbed wash of the room's mood that is hard to separate from their own",
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

// Tight planetary "conversations", short, behavioral readings for the Mastery Spot.
// Keys are sorted "A-B" alphabetically so lookup is deterministic.
const ASPECT_CONVERSATION: Record<string, { hard: string; soft: string }> = {
  "Moon-Sun": {
    hard: "an internal head/heart split, what they want and what they need don't always match, and they feel both pulls at once",
    soft: "internal alignment between what they want and what they need, the inside and the outside agree",
  },
  "Saturn-Sun": {
    hard: "an inner critic that audits every move and asks 'is this good enough yet?' before they've even started",
    soft: "natural discipline and the ability to play the long game without burning out",
  },
  "Pluto-Sun": {
    hard: "an all-or-nothing pressure around being seen, fully invisible or in full power, rarely in between",
    soft: "natural depth and the ability to regenerate after intense seasons",
  },
  "Sun-Uranus": {
    hard: "a freedom-versus-belonging tug, they bolt the second things feel boxed in",
    soft: "originality and permission to be themselves without apology",
  },
  "Mars-Sun": {
    hard: "drive on overdrive, they push through even when the body is asking them to slow",
    soft: "clean courage and the ability to act on what matters without overthinking",
  },
  "Sun-Venus": {
    hard: "identity tied to being liked, they may shape-shift a little to keep the love",
    soft: "natural warmth and easy magnetism in how they show up",
  },
  "Neptune-Sun": {
    hard: "an identity that blurs in groups, they absorb other people's roles and lose their own outline",
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
    hard: "feelings and actions on a hair-trigger, emotion fires before the pause arrives",
    soft: "emotional courage and the ability to act on what they feel without freezing",
  },
  "Moon-Saturn": {
    hard: "emotional self-protection, they may swallow the feeling instead of saying it out loud",
    soft: "emotional steadiness and the ability to hold their own through hard moments",
  },
  "Moon-Pluto": {
    hard: "feelings that arrive in big waves and need full expression before they can release",
    soft: "emotional depth and the capacity to be with other people's intensity without flinching",
  },
  "Moon-Uranus": {
    hard: "mood shifts that surprise even them, predictability has to be built, not assumed",
    soft: "emotional originality and freedom from inherited family patterns",
  },
  "Moon-Neptune": {
    hard: "emotional osmosis, they pick up the room's mood and carry it as if it were their own",
    soft: "deep empathy and a poetic emotional sense",
  },
  "Jupiter-Moon": {
    hard: "feelings that swell big, generosity that can leave them emotionally empty",
    soft: "natural emotional warmth, faith, and easy generosity of heart",
  },
  "Moon-Venus": {
    hard: "love and need tangled, they may confuse being needed with being loved",
    soft: "emotional warmth, easy affection, and a soothing presence",
  },
  "Chiron-Moon": {
    hard: "a tender early-comfort wound, small ruptures register much bigger than they look",
    soft: "compassion and the gift of soothing others through their own remembered tenderness",
  },
  "Mercury-Moon": {
    hard: "feelings and words running on different tracks, they may not have the language for what they feel in real time",
    soft: "the gift of putting emotion into clear, honest language",
  },
};


function aspectConversationKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

const HIDDEN_HOUSE_SHADOW: Record<number, string> = {
  6: "Handle their stress-responses through daily routine, not big sit-down confrontations. They process best while doing something side-by-side (walking, cooking, driving). Formal 'we need to talk' moments feel like an inspection and shut them down.",
  8: "Handle their stress-responses in private and with full honesty. Hidden tensions land harder than spoken ones for this person. They need transparency about what's really going on, never in front of an audience, and they need to know you can be trusted with the real story.",
  12: "Handle their stress-responses in private. Public correction is a major trigger here. They need quiet one-on-one reassurance to feel safe enough to stop performing. Address things in private, low volume, never in front of others.",
};

// ── NEW: Translation-rule data maps ──────────────────────────────────────────

// Friction Rule: when 3rd-cusp sign and its ruler's sign clash, what does the
// friction LOOK like in lived behavior? Keyed by ruler-sign element relationship.
const CLASH_FRICTION_BY_RULER_ELEMENT: Record<"fire" | "earth" | "air" | "water", string> = {
  fire:  "we sound calm on the surface, but inside we're already two steps ahead and pushing for the move",
  earth: "we sound easy and flexible out loud, but inside we are quietly tracking what's solid and what isn't",
  air:   "we sound personal and present, but inside we're running comparisons and looking for the cleaner frame",
  water: "we sound matter-of-fact, but inside we are reading the room's feeling and pricing it into every sentence",
};

const CLASH_BEHAVIOR_BY_RULER_ELEMENT: Record<"fire" | "earth" | "air" | "water", string> = {
  fire:  "we go quiet right before we make the actual move, because the inside has already decided and the mouth is just catching up",
  earth: "we say 'sure, that works' and then very slowly steer the plan toward the version our body trusts",
  air:   "we agree in conversation, then revise our position the moment we have space to think alone",
  water: "we change the temperature of a room without saying anything, and people feel it before we name it",
};

// Energy Rule: Mars-by-house, how the drive resets, and what shows up when it can't.
const MARS_HOUSE_DISCHARGE: Record<number, { action: string; shadow: string }> = {
  1:  { action: "moving the body first thing, claiming physical space before talking",                          shadow: "irritability that lands on whoever is closest, and a low-grade 'why am I picking a fight' feeling" },
  2:  { action: "physical work that produces something they can see or touch (cooking, building, lifting)",     shadow: "compulsive spending, food, or body-tinkering as a stand-in for the missing discharge" },
  3:  { action: "fast talking, fast walking, errand sprints, hands-on tinkering, quick wins",                  shadow: "verbal snapping, scattered tabs, and a brain that won't stop scrolling" },
  4:  { action: "physical work inside the home: rearranging, deep-cleaning, cooking, gardening",                shadow: "tension that detonates inside the family unit instead of out in the world" },
  5:  { action: "play, sport, art, creative risk, romance, anything that feels like joyful release",            shadow: "shame-spirals about 'wasted potential' and picking fights with the people they love most" },
  6:  { action: "structured exercise, routines they can master, fixing one small broken thing per day",         shadow: "body symptoms (gut, sleep, headaches) carrying the rage the mouth won't say" },
  7:  { action: "vigorous one-on-one engagement: sparring conversation, partnered training, real debate",       shadow: "passive-aggressive jabs at a partner, or a constant low simmer of 'they always start it'" },
  8:  { action: "intense private outlets: heavy lifting, sex, deep therapy work, deep dives into money and shared resources",        shadow: "control battles, sudden money chaos, or icy withdrawal that looks like punishment" },
  9:  { action: "long walks, travel, study sprints, big-stakes outdoor adventure, teaching",                   shadow: "preaching at people, restless 'I have to get out of here' agitation, picking fights about beliefs" },
  10: { action: "a real project, a public piece of work, building visible reputation",   shadow: "career sabotage, burnout, or aggression that lands on coworkers and bosses" },
  11: { action: "group sport, activism, organizing, sweating with friends",                                    shadow: "alienating their own friend group, or burning a bridge in a community they love" },
  12: { action: "private movement no one watches: solo swim, dawn run, breathwork, journaling sweat out",      shadow: "self-attack, depression-shaped fatigue, illness, or rage they turn inward instead of out" },
};

// Aspect Rule: per-planet GOAL ("wants") and CHALLENGE ("audits with"), in we/us voice.
const PLANET_GOAL: Record<string, string> = {
  Sun:     "to shine as the version of ourselves we actually are",
  Moon:    "to feel safe, soothed, and emotionally at home",
  Mercury: "to think out loud, swap ideas, and land on the truth in real time",
  Venus:   "to be loved, valued, and close to beauty",
  Mars:    "to act on what matters, right now, without committee",
  Jupiter: "to expand, mean something, and trust that more is possible",
  Saturn:  "to build something real that holds up over time",
  Uranus:  "to stay free, original, and unconverted by the group",
  Neptune: "to dissolve into something larger and trust the unseen current",
  Pluto:   "to face the real truth and use power honestly",
  Chiron:  "to make medicine out of the place we were once hurt",
};

const PLANET_CHALLENGE: Record<string, string> = {
  Sun:     "a question about whether we're actually allowed to be seen yet",
  Moon:    "a tightness around whether it's safe to need anything",
  Mercury: "a second-guess about whether our read is sharp enough",
  Venus:   "an audit about whether we're lovable as-is",
  Mars:    "a hesitation about whether we have the right to take the shot",
  Jupiter: "an excess valve that opens before we've checked our capacity",
  Saturn:  "a 'prove it' clause that asks if we've earned this yet",
  Uranus:  "a sudden exit-impulse the moment things feel boxed in",
  Neptune: "a fog that softens the edges and blurs the boundary line",
  Pluto:   "a control reflex that wants to manage every variable",
  Chiron:  "a tender spot that flares before the rest of us notices",
};

const ASPECT_EXTERNAL_LINE: Record<AspectName, string> = {
  conjunction:  "fused, like one signal not two",
  opposition:   "split, like we're arguing with ourselves in public",
  square:       "edgy, like we're bracing for impact",
  trine:        "easy, like nothing is actually happening here",
  sextile:      "interested, like we keep circling the same opportunity",
};

const ASPECT_INTERNAL_LINE: Record<AspectName, string> = {
  conjunction:  "blended so tightly that we can't tell which voice is which",
  opposition:   "torn between two equally true needs and trying to honor both",
  square:       "in active friction, with both sides demanding airtime at the same time",
  trine:        "quietly negotiating in the background, and easy to take for granted",
  sextile:      "in a real conversation, where one side keeps gently offering and the other keeps almost saying yes",
};

// Identity Collision: short modifier word for "practicing X with ___" when blending
// the Sun with its tightest aspect. Hard aspects use the friction word; soft aspects
// use the support word. Keeps the synthesis person-led, not "Sun in X is...".
const SUN_BLEND_MODIFIER: Record<string, { hard: string; soft: string }> = {
  Moon:    { hard: "Mood Crosscurrents",   soft: "Inner Permission" },
  Mercury: { hard: "a Running Commentary", soft: "Quick Translation" },
  Venus:   { hard: "a Charm Audit",        soft: "Easy Magnetism" },
  Mars:    { hard: "a Lit Fuse",           soft: "a Steady Engine" },
  Jupiter: { hard: "an Overpromise",       soft: "Room to Grow" },
  Saturn:  { hard: "Edges",                soft: "Structure" },
  Uranus:  { hard: "Surprise Exits",       soft: "Free Wiring" },
  Neptune: { hard: "Fog",                  soft: "a Soft Filter" },
  Pluto:   { hard: "Pressure",             soft: "Quiet Power" },
  Chiron:  { hard: "a Tender Spot",        soft: "a Healed Wound" },
};

// 12th House Rule: bodies whose presence in the 12th house triggers a cloaking note.
const CLOAKING_BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars"] as const;

// ── Pressure / Engine / Safety translation data ──────────────────────────────

// Surface archetype: what you LOOK LIKE when the 3rd-cusp sign is leading.
// Used for the "look like a ___" half of the Engine formula.
const SURFACE_ARCHETYPE_BY_SIGN: Record<string, string> = {
  Aries: "a sprinter",
  Taurus: "a builder",
  Gemini: "a reporter",
  Cancer: "a host",
  Leo: "a performer",
  Virgo: "an editor",
  Libra: "a diplomat",
  Scorpio: "a poker player",
  Sagittarius: "a teacher",
  Capricorn: "a CEO",
  Aquarius: "an analyst",
  Pisces: "a poet",
};

// Absorption archetype: what you ABSORB LIKE on the inside (the ruler's sign).
const ABSORPTION_ARCHETYPE_BY_SIGN: Record<string, string> = {
  Aries: "a struck match",
  Taurus: "a slow root system",
  Gemini: "a radio scanning every frequency",
  Cancer: "a tidepool",
  Leo: "a stage light tracking the room",
  Virgo: "a quality-control scanner",
  Libra: "a tuning fork",
  Scorpio: "a deep-sea sonar",
  Sagittarius: "an open road scanning for the exit",
  Capricorn: "a steel beam under load",
  Aquarius: "a circuit board",
  Pisces: "a sponge",
};

// Mars sign → the specific shape the pressure leak takes if the discharge
// route is blocked. Used in the Pressure Logic Consequence sentence.
const PRESSURE_CONSEQUENCE_BY_MARS_SIGN: Record<string, string> = {
  Aries:       "an Aries-style explosion, short, hot, all at once, then gone",
  Taurus:      "a Taurus-style stonewall, they go immovable and refuse to be moved",
  Gemini:      "a Gemini-style verbal cut, quick, articulate, surgical",
  Cancer:      "a Cancer-style emotional flood that takes hours to settle",
  Leo:         "a Leo-style pride flare, they freeze you out for not seeing them",
  Virgo:       "a Virgo-style hyper-criticism aimed at whoever is closest",
  Libra:       "a Libra-style cold politeness that quietly ends the conversation",
  Scorpio:     "a Scorpio-style total shutdown, eye contact gone, room temperature drops",
  Sagittarius: "a Sagittarius-style 'I'm out', they leave the room, the topic, or the plan",
  Capricorn:   "a Capricorn-style icy withdrawal, work-mode replaces relationship-mode",
  Aquarius:    "an Aquarius-style detachment, they go conceptual and stop being reachable",
  Pisces:      "a Pisces-style dissolve, they fog out, get sick, or disappear inward",
};

// Sun sign → "their desire to ___" for the Internal Audit / Safety formula.
const SUN_DESIRE_BY_SIGN: Record<string, string> = {
  Aries:       "move first and take the shot",
  Taurus:      "build something they can stand on",
  Gemini:      "say the thing out loud and see what comes back",
  Cancer:      "tend the people they love",
  Leo:         "be fully seen as themselves",
  Virgo:       "do the thing well and useful",
  Libra:       "land on what is actually fair",
  Scorpio:     "go all the way in and tell the truth",
  Sagittarius: "name the bigger meaning",
  Capricorn:   "build a track record that holds up",
  Aquarius:    "stay original and uncoopted",
  Pisces:      "dissolve into something larger and trust it",
};

// Moon sign → "their need to ___" version of the same.
const MOON_DESIRE_BY_SIGN: Record<string, string> = {
  Aries:       "react in real time without filtering",
  Taurus:      "settle into steady physical comfort",
  Gemini:      "talk the feeling into shape",
  Cancer:      "be physically close to the people who matter",
  Leo:         "be warmly received, not just tolerated",
  Virgo:       "have a useful task to hold during the feeling",
  Libra:       "have the room be peaceful and fair",
  Scorpio:     "be trusted with the real story",
  Sagittarius: "have room to roam while they process",
  Capricorn:   "know there is a real structure holding them",
  Aquarius:    "be treated as a peer, not a problem",
  Pisces:      "soak in soft sensory input and rest",
};

// What the auditing planet does NOT want to happen, used after "they are
// careful because they don't want to ___" in the Safety/Audit sentence.
const AUDIT_LOSS_BY_PLANET: Record<string, string> = {
  Saturn:  "be caught short, be wrong in public, or look incompetent",
  Pluto:   "be overpowered, blindsided, or stripped of control",
  Uranus:  "be domesticated, predictable, or trapped inside someone else's expectation",
  Mars:    "show their hand before they're ready or pick the wrong fight",
  Neptune: "lose the dream by naming it too literally",
  Chiron:  "have the old wound get touched in front of the wrong person",
};

// Pressure Rule trigger: which bodies count as "Captain or Engine."
// Chart Ruler is computed dynamically; these are the engines.
const PRESSURE_ENGINE_BODIES = ["Mars", "Saturn"] as const;

// House-themed cloaking need: when the pressure body is in a given house,
// what does the person need protected/given?
const PRESSURE_NEED_BY_HOUSE: Record<number, string> = {
  1:  "uninterrupted time alone in their own body before any group asks anything of them",
  2:  "private control of money, food, and physical comforts without being audited",
  3:  "the right to draft their thoughts in private before being asked to explain",
  4:  "an actual locked door at home and zero unannounced family check-ins",
  5:  "private creative time where no one watches the work in progress",
  6:  "uninterrupted routine, no surprise schedule changes on the day-of",
  7:  "one-on-one time without an audience and without third parties weighing in",
  8:  "total privacy around money, intimacy, and what they're processing emotionally",
  9:  "room to wrestle privately with their own beliefs before being asked to defend them",
  10: "the ability to manage their public reputation themselves, in their own timing",
  11: "the right to step out of the group when the group gets loud",
  12: "real, scheduled, uninterrupted alone time, not 'when there's a gap' alone time",
};

const PRESSURE_NEED_LABEL_BY_HOUSE: Record<number, string> = {
  1: "Solo Recharge", 2: "Resource Privacy", 3: "Drafting Time",
  4: "Locked-Door Time", 5: "Private Creative Time", 6: "Routine Protection",
  7: "One-on-One Time", 8: "Total Privacy", 9: "Belief Privacy",
  10: "Reputation Control", 11: "Off-Group Time", 12: "Cloaking Time",
};

// ── Real Talk · Decipher data ────────────────────────────────────────────────
// "Survival strategy" framing: what each sign actually DOES to stay safe or
// feel powerful, plus the payoff feeling they're chasing. Used by the
// Decipher button to swap abstract synthesis lines for blunt translations.
const SIGN_SURVIVAL_MASK: Record<string, string> = {
  Aries:       "lead with speed and the willingness to start a fight",
  Taurus:      "go still and refuse to be moved",
  Gemini:      "use words and quick subject changes to keep the room loose",
  Cancer:      "take care of you so the door between you stays open",
  Leo:         "turn up the warmth so love arrives on their terms",
  Virgo:       "point out the flaw before someone else can",
  Libra:       "use a 'nice' mask to quiet the room quickly",
  Scorpio:     "stay quiet and read you while you read nothing",
  Sagittarius: "crack a joke and keep one foot toward the door",
  Capricorn:   "be the most competent person in the room",
  Aquarius:    "play the 'I'm the weird one' card so the group can't absorb them",
  Pisces:      "go soft and 'I'm fine' so the actual feeling stays private",
};

const SIGN_PAYOFF: Record<string, string> = {
  Aries: "unstoppable", Taurus: "un-rushable", Gemini: "un-cornerable",
  Cancer: "indispensable", Leo: "chosen", Virgo: "un-criticizable",
  Libra: "un-trappable", Scorpio: "un-readable", Sagittarius: "free",
  Capricorn: "in charge", Aquarius: "un-coopted", Pisces: "unfindable",
};

// Per-sign "real reason" used inside the Mastery Spot Decipher.
const SATURN_REAL_REASON: Record<string, string> = {
  Aries:       "learned early that hesitating got them run over, so 'go first' became survival",
  Taurus:      "learned early that being rushed cost them something real, so 'no, on my timing' became survival",
  Gemini:      "learned early that the wrong word landed them in trouble, so picking words carefully became survival",
  Cancer:      "learned early that softness wasn't always met, so armoring up became survival",
  Leo:         "learned early that being seen had a cost, so dimming the light became survival",
  Virgo:       "learned early that mistakes got named loudly, so being unimprovable became survival",
  Libra:       "learned early that conflict broke the bond, so smoothing the room became survival",
  Scorpio:     "learned early that opening up got used against them, so keeping the inside private became survival",
  Sagittarius: "learned early that their truth was 'too much,' so under-stating it became survival",
  Capricorn:   "learned early that no one else was coming, so being the responsible one became survival",
  Aquarius:    "learned early that fitting in cost them themselves, so staying outside became survival",
  Pisces:      "learned early that structure felt like a cage, so dissolving became survival",
};






// ── Output type ──────────────────────────────────────────────────────────────
export type DevelopmentalStage =
  | "Lunar Phase (0-7)"
  | "Mercury Phase (8-12)"
  | "Mars / Identity Phase (13-21)"
  | "Saturn Return: Building the Foundation (22-35)"
  | "Uranus Opposition: Mid-Life Awakening (36-45)"
  | "Chiron Return: The Wound Becomes Expertise (46-55)"
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

  // NEW: The lead story, luminary in hard aspect to Saturn/Pluto/Uranus
  coreConflict?: {
    luminary: "Sun" | "Moon";
    luminarySign: string;
    outerPlanet: string;
    outerSign: string;
    aspect: AspectName;
    orb: number;
    synthesis: string;
    realTalk?: string;
  };

  // NEW: How they actually communicate (3rd house sign vs. its ruler's placement)
  hiddenEngine?: {
    thirdSign: string;
    rulerName: string;
    rulerSign: string;
    rulerHouse: number | null;
    synthesis: string;
    realTalk?: string;
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
    saturn?: { sign: string; house: number | null; struggle: string; howToSupport: string; adultStandardLabel?: string; realTalk?: string };
    chiron?: { sign: string; house: number | null; tender: string; howToSupport: string; realTalk?: string };
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

  // NEW: Chart Ruler, the "Captain of the Ship" (ruler of Ascendant)
  chartRuler?: {
    rulerName: string;
    rulerSign: string;
    rulerHouse: number | null;
    rulerDegree?: number | null;
    rulerRetrograde?: boolean;
    ascSign: string;
    line: string;
    realTalk?: string;
    dispositor?: {
      name: string;
      sign: string;
      house: number | null;
      degree: number | null;
      retrograde?: boolean;
    };
  };


  // NEW: Tightest planetary "conversations", top luminary aspects with behavioral readings
  tightestAspects?: Array<{
    a: string;
    b: string;
    aspect: AspectName;
    orb: number;
    quality: "hard" | "soft";
    line: string;
  }>;

  // NEW: Moon Phase Profile (Sun–Moon angular distance), names Balsamic etc.
  moonPhaseProfile?: {
    phase: MoonPhaseName;
    angle: number;     // 0–360
    label: string;
    instinct: string;
    banTold: string;
    trueWork: string;
  };

  // NEW: Node-House synthesis (comfort of X / edge of Y)
  nodeHouseSynthesis?: {
    snSign: string;
    snHouse: number | null;
    nnSign: string;
    nnHouse: number | null;
    line: string;
  };



  howTo: {
    ritual: string;
    learningStyle: string;
    boundary: string;
  };

  // NEW: Structured Cognitive Profile (replaces fortune-cookie learning adjectives)
  cognitiveProfile?: {
    mercurySign: string;
    label: string;             // e.g. "Systems Architect (Lateral Thinker)"
    processing: string;        // HOW the mind takes in information
    blocker: string;           // what shuts the intake down
    application: string;       // real-world "so what" for parents/partners
    thirdCuspSign?: string;
    intakeStyle?: string;      // 3rd-house cusp modifier
    rulerNudge?: string;       // 3rd-house ruler nudge
  };

  // Lightweight placements used by the Narrative Briefing prose blocks
  venusPlacement?: { sign: string; house: number | null; degree: number | null; retrograde?: boolean };
  chironPlacement?: { sign: string; house: number | null; degree: number | null; retrograde?: boolean };
  ascDegree?: number | null;
  twelfthHouseBodies?: Array<{ name: string; sign: string }>;

  mathCheck: {
    thirdHouseSign?: string;
    thirdHouseRuler?: string;
    thirdHouseRulerSign?: string;
    thirdHouseRulerHouse?: number | null;
    sunAspects: Array<{ to: string; aspect: AspectName; orb: number }>;
    moonAspects: Array<{ to: string; aspect: AspectName; orb: number }>;
  };

  // NEW · Friction Rule: house cusp sign (surface language) vs. its ruler's sign (inner OS).
  // Same data the Hidden Engine reads, re-shaped with the "Cognitive Clash" formula in we/us voice.
  cognitiveClash?: {
    cuspSign: string;       // 3rd house cusp = surface language
    rulerName: string;
    rulerSign: string;      // internal operating system
    rulerHouse: number | null;
    friction: string;       // the specific friction
    behavior: string;       // real-world behavior the friction produces
    line: string;           // the full formatted paragraph
    realTalk?: string;
  };

  // NEW · Energy Rule: Mars by house = how the drive needs to discharge.
  energyDischarge?: {
    marsSign: string;
    marsHouse: number;
    action: string;     // how they reset
    shadow: string;     // what happens if they can't
    line: string;
    realTalk?: string;
  };

  // NEW · Aspect Rule: tightest aspect under 2.0° orb between any two of the named bodies.
  internalTugOfWar?: {
    a: string;
    aSign: string;
    b: string;
    bSign: string;
    aspect: AspectName;
    orb: number;
    goal: string;       // what Planet A wants
    challenge: string;  // how Planet B audits it
    external: string;   // how it looks from the outside
    internal: string;   // what's actually felt inside
    line: string;
    realTalk?: string;
  };

  // NEW · 12th House Rule: cloaking flag for any personal planet or chart ruler in 12.
  cloakingNote?: {
    bodies: Array<{ name: string; sign: string }>;   // planets sitting in the 12th
    line: string;
    realTalk?: string;
  };

  // NEW · Pressure Rule: when Chart Ruler / Mars / Saturn sits in the 12th,
  // in Scorpio, or in hard aspect to Pluto, name the internal pressure +
  // concrete consequence if the cloaking need isn't met.
  pressureSignature?: {
    body: string;          // which engine/captain is under pressure
    bodySign: string;
    bodyHouse: number | null;
    trigger: "12th house" | "Scorpio" | "Pluto aspect";
    needLabel: string;     // e.g. "Cloaking Time"
    need: string;          // the specific house-themed thing to provide
    consequence: string;   // what happens if the need is denied
    line: string;
    realTalk?: string;
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
    // Plain-English breakdown of the three placements that drive this stage.
    const sunPlain = sunSign ? (SUN_PLAIN_BY_SIGN[sunSign] ?? `a ${sunSign} core`) : "their core self";
    const sunHousePlain = sunHouse ? ` ${SUN_HOUSE_PLAIN[sunHouse] ?? ""}` : "";
    const sunSentence = sunSign
      ? `${sunSign} Sun${sunHouse ? ` in the ${ordinal(sunHouse)} house` : ""} means ${name} is ${sunPlain}.${sunHousePlain}`
      : "";
    const chironPlain = chironSign ? (CHIRON_TENDER_BY_SIGN[chironSign] ?? "a specific sore spot only they fully know") : "";
    const chironSentence = chironSign
      ? `Chiron in ${chironSign} means the old wound is about ${chironPlain}. That sore spot has been there since childhood.`
      : "";
    const jupiterPlain = jupiterSign ? (JUPITER_TEACHES_BY_SIGN[jupiterSign] ?? `${jupiterSign} territory`) : "";
    const jupiterSentence = jupiterSign
      ? `Jupiter in ${jupiterSign} means ${name}'s natural teaching ground is ${jupiterPlain}.`
      : "";
    const stageSentence = `Put together, this is the Chiron Return decade (around ages 49-50): the wound stops being a thing ${name} hides and turns into the exact thing other people start asking them for help with. Jupiter${jupiterSign ? ` in ${jupiterSign}` : ""} gives them the plain words to teach it.`;
    return {
      stage: "Chiron Return: The Wound Becomes Expertise (46-55)",
      focus: `${sunFocus} · Chiron ${chironSign ? `in ${chironSign}` : ""} · Jupiter ${jupiterSign ? `in ${jupiterSign}` : ""}`.trim(),
      body: [sunSentence, chironSentence, jupiterSentence, stageSentence].filter(Boolean).join(" "),
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

  // 3rd house ruler, for both Mercury stage and learning style
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
    body = `${chart.name} is learning safety through their body, not through words. What builds it is ${safety}.${houseClause} Small, calm, repeated moments do more than any single big talk.`;
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
  // Rising Filter = Behavioral Astrology only. No invented archetypes (no "Explorer/Teacher/CEO").
  // Structure: Sun+Rising combo as Nervous-System Goal → ruler as the engine/drive → kitchen scene → elder advice.
  // The ruler is cited as planet-in-sign-in-house with its drive, NOT relabeled as a mask archetype.
  let risingLine = "";
  if (ascSign) {
    const scanner = RISING_SCANNER[ascSign];
    const rulerNameForFilter = TRADITIONAL_RULERS[ascSign];
    const rulerPlanetForFilter = rulerNameForFilter ? planets[rulerNameForFilter] : undefined;
    const rulerSignForFilter = rulerPlanetForFilter?.sign;
    const rulerHouseForFilter = rulerPlanetForFilter ? houseOf(chart, rulerPlanetForFilter) : null;
    const falseStory = RISING_FALSE_STORY[ascSign] ?? "what people first assume";
    const kitchen = RISING_KITCHEN_BEHAVIOR[ascSign] ?? "";
    const elderTip = RISING_ELDER_ADVICE[ascSign] ?? "";
    // Sun+Rising combo: practicing the Sun's work inside the Rising's scan.
    const sunPracticeHere = sunSign ? (SUN_PRACTICE_BY_SIGN[sunSign] ?? "their own way of being seen") : "";
    const sunHouseClause = sunHouse ? ` in the ${ordinal(sunHouse)} house (${HOUSE_THEME[sunHouse]})` : "";
    if (scanner && rulerNameForFilter && rulerSignForFilter) {
      // Behavioral overrides for specific ruler placements (no metaphor labels).
      // Venus in Sagittarius in the 2nd house = Autonomy / Zero Entanglements (not "horizons").
      const isVenusSag2H = rulerNameForFilter === "Venus" && rulerSignForFilter === "Sagittarius" && rulerHouseForFilter === 2;
      const drive = isVenusSag2H
        ? "Zero Entanglements: the right to change their mind and walk away without negotiating it"
        : (RULER_SIGN_DRIVE[rulerSignForFilter] ?? "what matters most to them");
      const houseClause = rulerHouseForFilter ? `, ${ordinal(rulerHouseForFilter)} house` : "";
      // 1) Sun+Rising behavioral truth. 2) Ruler = engine/drive (no archetype label). 3) Nervous-system goal. 4) Kitchen + elder.
      const lead = sunSign
        ? `${chart.name} is practicing ${sunPracticeHere} (${sunSign} Sun${sunHouseClause}) and scans the room as a ${scanner.mask} (${ascSign} Rising) so that work can happen safely. `
        : `${chart.name} scans the room as a ${scanner.mask} (${ascSign} Rising). `;
      risingLine =
        lead +
        `The engine running that scan is ${rulerNameForFilter} in ${rulerSignForFilter}${houseClause}, and it needs ${drive}. ` +
        `${chart.name} isn't ${falseStory}; the nervous-system goal is ${scanner.safety} so ${drive} stays intact. ` +
        (kitchen ? `What this looks like at 8 AM in the kitchen: ${kitchen}. ` : "") +
        (elderTip ? `For the adult in the room: ${elderTip}` : "");

      // SURGICAL OVERRIDE: Libra Rising + 1st House Sun = "Nice for a Reason" / polite buffer copy.
      if (ascSign === "Libra" && sunHouse === 1) {
        const venusClause = isVenusSag2H
          ? ` The Venus in Sagittarius (2nd house) underneath that mask values Zero Entanglements: ${chart.name} will trade comfort for the right to walk away. If a situation starts closing in, the Libra charm drops and Sagittarius bluntness comes out to clear the room.`
          : ` Underneath, ${rulerNameForFilter} in ${rulerSignForFilter}${houseClause} is the engine: it needs ${drive}.`;
        risingLine =
          `${chart.name} uses a Libra Diplomat mask to build a polite buffer around themselves. ` +
          `${chart.name} isn't being nice to be liked; being nice keeps people at a distance so they don't interfere with the 1st-house need to just be themselves. ` +
          `It is a peace treaty ${chart.name} signs every morning to buy a little space.` +
          venusClause +
          (kitchen ? ` At 8 AM in the kitchen: ${kitchen}.` : "") +
          (elderTip ? ` For the adult in the room: ${elderTip}` : "");
      }
    } else if (scanner) {
      const lead = sunSign
        ? `${chart.name} is practicing ${sunPracticeHere} (${sunSign} Sun${sunHouseClause}) and scans the room as a ${scanner.mask} (${ascSign} Rising) so that work can happen safely. `
        : `${chart.name} scans the room as a ${scanner.mask} (${ascSign} Rising). `;
      risingLine =
        lead +
        `${chart.name} isn't ${falseStory}; the nervous-system goal is ${scanner.safety}. ` +
        (kitchen ? `At 8 AM in the kitchen: ${kitchen}. ` : "") +
        (elderTip ? `For the adult in the room: ${elderTip}` : "");
    } else {
      risingLine = `${chart.name}'s ${ascSign} Rising is the filter people meet first. It is a scan pattern, not the inner self.`;
    }
  }
  // The Lead Story: Sun + tightest aspect as a single collision.
  // Formula: practicing X while fighting Y → "this looks like..." → nervous-system reason → elder advice.
  // Special case: Sun in the 1st house = self-visibility work (the Work is being seen at all).
  let sunLine = "";
  if (sunSign) {
    const practice = SUN_PRACTICE_BY_SIGN[sunSign] ?? "their own way of being seen";
    const tightSun = sunAspects[0];
    // 1st-house Sun overlay: the pressure is to Exist Out Loud (concrete behavior, not "self-advocacy").
    const firstHouseOverlay = sunHouse === 1
      ? ` Because the Sun sits in the 1st house, ${chart.name} feels like their very existence has to be "fair", a lot of energy goes into checking whether they are allowed to take up space. The work isn't self-advocacy in the abstract; it is standing still in the center of the room without apologizing for it.`
      : "";
    if (tightSun && tightSun.orb <= 6.0 && SUN_BLEND_MODIFIER[tightSun.to]) {
      const ap = tightSun.to;
      const apSign = planets[ap]?.sign ?? "";
      const apHouse = planets[ap] ? houseOf(chart, planets[ap]) : null;
      const isHard = HARD_ASPECTS.includes(tightSun.aspect);
      
      const challenge = PLANET_CHALLENGE[ap] ?? "an inner audit";
      const goal = PLANET_GOAL[ap] ?? "their own truth";
      const fightVerb = isHard ? "fighting" : "negotiating with";
      sunLine =
        `${chart.name} is practicing ${practice} while ${fightVerb} ${challenge} (${sunSign} Sun ${tightSun.aspect} ${apSign} ${ap}${apHouse ? `, ${ordinal(apHouse)} house` : ""}, orb ${tightSun.orb.toFixed(1)}°). ` +
        `This looks like taking two steps forward and then auditing whether they were allowed to. ` +
        `${chart.name} isn't being difficult or distant, the nervous system is protecting ${goal} from getting exposed too fast.` +
        firstHouseOverlay + ` ` +
        `For the adult in the room: don't critique the hesitation. Name what they already did and let that be enough out loud.`;
    } else {
      sunLine =
        `${chart.name} is practicing ${practice}${sunHouse ? ` inside ${HOUSE_THEME[sunHouse]}` : ""} (${sunSign} Sun${sunHouse ? `, ${ordinal(sunHouse)} house` : ""}). ` +
        `This is what they are growing into, not what they already are.` +
        firstHouseOverlay + ` ` +
        `For the adult in the room: reflect back the moments you actually see them do it. That is what locks it in.`;
    }
  }

  const phase = lifePhaseFor(age);
  const nnSign = NorthNode?.sign;
  const nnHouse = houseOf(chart, NorthNode);
  const nnDefault = nnSign ? (NORTH_NODE_STRETCH_BY_SIGN[nnSign] ?? "the direction they're growing toward") : "";
  const nnLine = nnSign
    ? phase === "child"
      ? `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""} is the soul's stretch: ${nnDefault}. It will feel uncomfortable on purpose.`
      : phase === "elder"
        ? `North Node in ${nnSign}${nnHouse ? ` (${ordinal(nnHouse)} house)` : ""}: the lessons mastered here are ${nnDefault}. This is the wisdom they've earned the right to teach.`
        : `The most honest direction for ${chart.name} right now is ${nnDefault}. It feels uncomfortable on purpose, that discomfort is the signal they are headed the right way (North Node in ${nnSign}${nnHouse ? `, ${ordinal(nnHouse)} house` : ""}).`
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
    ? `Stop ${snTired}. Start ${nnCall}. The old habit feels safe, but the energy has already left it, the aliveness is on the other side.`
    : undefined;

  // For adults, lead with the bottom-line interpretation
  const nnLineFinal = nnSign && phase === "adult"
    ? `Where ${chart.name}'s energy actually returns right now: ${nnDefault}. Every time they default to the old habit instead, they feel flat, that flatness is the signal to pivot here (North Node in ${nnSign}${nnHouse ? `, ${ordinal(nnHouse)} house` : ""}).`
    : nnLine;

  // === 3. Mastery Spot ====================================================
  const saturnSign = Saturn?.sign;
  const saturnHouse = houseOf(chart, Saturn);
  const isAdultLike = phase === "adult" || phase === "elder";
  const saturnAdultLabel = saturnHouse ? SATURN_HOUSE_ADULT_STANDARD[saturnHouse] : undefined;
  const partnerVerb = isAdultLike ? "How to partner with this energy" : "How to support";
  const saturnBlock: NonNullable<ChildPortrait["masterySpot"]["saturn"]> | undefined = saturnSign
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
  const chironBlock: NonNullable<ChildPortrait["masterySpot"]["chiron"]> | undefined = chironSign
    ? {
        sign: chironSign,
        house: chironHouse,
        tender: chironTender,
        howToSupport: isAdultLike
          ? `The thing ${chart.name} felt "less than" about in their twenties (${chironTender}) is exactly what other people now need their help with. It stopped being a wound to hide and became the reason people trust them. Stop protecting the scar. Show it on purpose.`
          : `When ${chart.name} bumps this wound, the antidote is never "you shouldn't feel that way." Name it: "I can see this is the sore spot. I am not going anywhere." Repair after rupture, every time.`,
      }
    : undefined;

  // === 3b. Chiron Return Spotlight (ages 45-52): Credentialing of the Wound
  let chironReturnSpotlight: ChildPortrait["chironReturnSpotlight"] = undefined;
  if (age != null && age >= 45 && age <= 52 && chironSign) {
    chironReturnSpotlight = {
      title: "The Wound Becomes the Expertise",
      body: `The biggest thing ${chart.name} struggled with in their twenties, ${chironTender} (Chiron in ${chironSign}${chironHouse ? `, ${ordinal(chironHouse)} house` : ""}), is finally becoming their greatest strength. This is the heart of the reading right now. The wound is not getting louder; other people are starting to come to ${chart.name} for help with the exact thing that used to hurt. The job this decade is not more healing for themselves. It is letting other people benefit from the path they already walked.`,
    };
  }

  // === 4. How-To ==========================================================
  const ritualMoon = moonSign ? MOON_SAFETY_BY_SIGN[moonSign] : null;
  const ritualVenus = Venus?.sign ? VENUS_LOVE_BY_SIGN[Venus.sign] : null;
  const ritual = ritualMoon && ritualVenus
    ? `A daily 5-minute ritual: ${ritualMoon}. Weekly, layer in ${ritualVenus} so they feel cared for in a way they actually notice.`
    : ritualMoon
      ? `A daily 5-minute ritual: ${ritualMoon}.`
      : "A daily 5-minute ritual that respects their nervous system.";

  // === 4b. Cognitive Profile (Mercury sign + 3rd-house cusp) ==============
  // This replaces vague "learning style" adjectives with a named processing profile,
  // its blocker, and a real-world application.
  const cogProfile = mercurySign ? MERCURY_COGNITIVE_PROFILE[mercurySign] : undefined;
  const intakeStyle = thirdCuspSign ? THIRD_HOUSE_CUSP_INTAKE[thirdCuspSign] : undefined;
  const rulerNudge = thirdRulerName ? (THIRD_HOUSE_RULER_NUDGE[thirdRulerName] ?? "") : "";
  const cognitiveProfile = cogProfile
    ? {
        mercurySign: mercurySign!,
        label: cogProfile.label,
        processing: cogProfile.processing,
        blocker: cogProfile.blocker,
        application: cogProfile.application,
        thirdCuspSign,
        intakeStyle,
        rulerNudge: rulerNudge || undefined,
      }
    : undefined;

  // The single-line "learningStyle" string keeps backwards compatibility with the
  // existing How-To card. It now uses Cognitive-Profile language, not adjectives.
  const learningStyle = cogProfile
    ? `${chart.name} is a ${cogProfile.label}: ${cogProfile.processing}. Real-world application: ${cogProfile.application}.${intakeStyle ? ` Intake note (3rd-house cusp in ${thirdCuspSign}): ${intakeStyle}.` : ""}${rulerNudge ? ` Add: ${rulerNudge}.` : ""}`
    : `${chart.name} learns best at their own pace and through their own filter.${rulerNudge ? ` ${rulerNudge.charAt(0).toUpperCase() + rulerNudge.slice(1)}.` : ""}`;

  // Personal Standards / Boundary is a COMMUNICATION STRATEGY, not a restatement
  // of the Mastery Spot. We translate the Saturn theme into an actual script
  // (what to say, what to avoid) and pair it with the Mars-based nervous-system
  // reset. We never re-quote the inner-Saturn struggle line here, that lives
  // in the Mastery Spot.
  const commScript = saturnSign ? SATURN_COMMUNICATION_SCRIPT[saturnSign] : null;
  const boundaryMars = marsSign ? MARS_RESET_BY_SIGN[marsSign] : null;
  let boundary: string;
  if (isAdultLike) {
    const standardClause = saturnAdultLabel
      ? ` Frame it as a ${saturnAdultLabel}, this territory is theirs to set, not anyone else's to approve.`
      : "";
    const resetClause = boundaryMars ? ` If the nervous system is already hot, reset first: ${boundaryMars}, then deliver the line.` : "";
    const scriptClause = commScript
      ? ` Try the opener: ${commScript.opener} Avoid ${commScript.avoid}, which collapses the conversation before it starts.`
      : "";
    boundary = `Course correct through language, not pressure.${scriptClause}${resetClause}${standardClause}`.trim();
  } else {
    const resetClause = boundaryMars ? ` First, regulate the body: ${boundaryMars}.` : "";
    const scriptClause = commScript
      ? ` Then use the opener: ${commScript.opener} Avoid ${commScript.avoid}, for them, that tone registers as "I am defective," not "I made a mistake."`
      : " Then state the limit calmly as structure, not shame.";
    boundary = `Redirect, then communicate.${resetClause}${scriptClause}`.trim();
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
    const desire = c.luminary === "Sun"
      ? (SUN_DESIRE_BY_SIGN[c.luminarySign] ?? "be themselves out loud")
      : (MOON_DESIRE_BY_SIGN[c.luminarySign] ?? "feel safe in their own skin");
    const loss = AUDIT_LOSS_BY_PLANET[c.outerPlanet] ?? "lose control of the outcome";
    const synthesis = `${chart.name}'s ${c.luminarySign} ${c.luminary} (${lumFlavor}) ${aspectVerb} ${c.outerPlanet} in ${c.outerSign} (orb ${c.orb.toFixed(1)}°). This is The Internal Audit: their desire to ${desire} is being audited in real time by ${audit}. They aren't hesitant and they aren't shy, they are careful, because they don't want to ${loss}. What you may be reading as "distant," "over-prepared," or "too logical" is actually ${fear} from the inside. The work is not to silence the ${c.outerPlanet}. It is to let the ${c.luminarySign} ${c.luminary} lead first and let ${c.outerPlanet} edit second, instead of the other way around.`;

    coreConflict = { ...c, synthesis };
  }

  // === 6. SYNTHESIS: Hidden Engine (3rd house ruler) ======================
  let hiddenEngine: ChildPortrait["hiddenEngine"] = undefined;
  if (thirdCuspSign && thirdRulerName && thirdRulerSign) {
    const voice = THIRD_HOUSE_VOICE_TONE[thirdCuspSign] ?? "their own";
    const undercurrent = RULER_UNDERCURRENT_BY_SIGN[thirdRulerSign] ?? "a private undercurrent";
    const domain = thirdRulerHouse ? HOUSE_UNDERCURRENT_DOMAIN[thirdRulerHouse] : null;
    const domainClause = domain ? `, ${domain}` : "";
    const surfaceArch = SURFACE_ARCHETYPE_BY_SIGN[thirdCuspSign] ?? "themselves";
    const absorbArch = ABSORPTION_ARCHETYPE_BY_SIGN[thirdRulerSign] ?? "an open channel";
    const synthesis = `${chart.name} speaks the language of ${voice} (3rd-house cusp in ${thirdCuspSign}), but the actual engine driving their voice is ${thirdRulerName} in ${thirdRulerSign}${thirdRulerHouse ? ` in the ${ordinal(thirdRulerHouse)} house` : ""}. They look like ${surfaceArch}, but they absorb like ${absorbArch}. Underneath the surface tone there is ${undercurrent}${domainClause}. The ah-ha: if you only address the surface (the ${thirdCuspSign} tone), you clog the undercurrent (the ${thirdRulerSign} processing), and the next thing that comes out is either a sudden quiet or a sudden too-much. Speak to both layers and the whole channel stays open.`;

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


  // === 9. Chart Ruler ("Boss of the Chart") ================================
  // Dynamic Astrology: Rising filter is fueled BY the chart ruler's placement.
  // We name the rising stereotype only to ban it, then describe the real intent.
  let chartRuler: ChildPortrait["chartRuler"] = undefined;
  if (ascSign) {
    const rulerName = TRADITIONAL_RULERS[ascSign];
    const rulerPlanet = rulerName ? planets[rulerName] : undefined;
    if (rulerName && rulerPlanet?.sign) {
      const rulerHouse = houseOf(chart, rulerPlanet);
      const filter = RISING_FILTER[ascSign];
      const drive = RULER_SIGN_DRIVE[rulerPlanet.sign] ?? "what they truly care about";
      const houseClause = rulerHouse ? `, running through ${HOUSE_THEME[rulerHouse]}` : "";
      const line = filter
        ? `${chart.name}'s ${ascSign} Filter isn't about being ${filter.stereotype}. It is fueled by ${rulerName} in ${rulerPlanet.sign}${rulerHouse ? ` (${ordinal(rulerHouse)} house)` : ""}, which means they ${filter.verb} in order to protect ${drive}${houseClause}. The surface job of the filter is to ${filter.surfaceJob}; the deeper job, run by ${rulerName}, is to keep ${drive} intact.`
        : `With ${ascSign} Rising, the chart's boss is ${rulerName} in ${rulerPlanet.sign}${rulerHouse ? ` (${ordinal(rulerHouse)} house)` : ""}, which means ${chart.name}'s motivation runs through ${drive}${houseClause}.`;
      // Dispositor chain: who hosts the chart ruler's sign?
      let dispositor: NonNullable<ChildPortrait["chartRuler"]>["dispositor"] = undefined;
      const dispoName = TRADITIONAL_RULERS[rulerPlanet.sign];
      if (dispoName && dispoName !== rulerName) {
        const dispoPlanet = planets[dispoName];
        if (dispoPlanet?.sign) {
          dispositor = {
            name: dispoName,
            sign: dispoPlanet.sign,
            house: houseOf(chart, dispoPlanet),
            degree: dispoPlanet.degree ?? null,
            retrograde: !!(dispoPlanet as any).isRetrograde,
          };
        }
      }
      chartRuler = { rulerName, rulerSign: rulerPlanet.sign, rulerHouse, rulerDegree: rulerPlanet.degree ?? null, rulerRetrograde: !!(rulerPlanet as any).isRetrograde, ascSign, line, dispositor };
    }
  }

  // === 11. Moon Phase Profile (Sun–Moon angular distance) =================
  let moonPhaseProfile: ChildPortrait["moonPhaseProfile"] = undefined;
  const sunLonForPhase = absLon(Sun);
  const moonLonForPhase = absLon(Moon);
  if (sunLonForPhase != null && moonLonForPhase != null) {
    const { phase: mphase, angle } = computeMoonPhase(sunLonForPhase, moonLonForPhase);
    const p = MOON_PHASE_PROFILE[mphase];
    moonPhaseProfile = {
      phase: mphase,
      angle,
      label: p.label,
      instinct: `${chart.name} ${p.instinct}.`,
      banTold: p.banTold + ".",
      trueWork: p.trueWork + ".",
    };
  }

  // === 12. Node-House Synthesis (comfort of / edge of) ====================
  let nodeHouseSynthesis: ChildPortrait["nodeHouseSynthesis"] = undefined;
  if (snSign && nnSign) {
    const comfort = snHouse ? HOUSE_COMFORT[snHouse] : null;
    const edge = nnHouse ? HOUSE_EDGE[nnHouse] : null;
    if (comfort && edge) {
      const line = `With a ${snSign} South Node in the ${ordinal(snHouse!)} house, ${chart.name}'s Tired Habit is ${comfort}, run in a ${snSign} style. The life pulse is pulling toward the ${nnSign} North Node in the ${ordinal(nnHouse!)} house: ${edge}. The honest move is to stop performing ${comfort.replace(/^the comfort of /, "")} and start showing up for ${edge.replace(/^the (intensity|edge) of /, "")}.`;
      nodeHouseSynthesis = { snSign, snHouse, nnSign, nnHouse, line };
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

  // === TRANSLATION RULE 1: The Cognitive Clash (Friction Rule) ============
  // Surface language = 3rd-house cusp sign. Internal OS = its ruler's sign.
  let cognitiveClash: ChildPortrait["cognitiveClash"] = undefined;
  if (thirdCuspSign && thirdRulerName && thirdRulerSign) {
    const cuspEl = ELEMENT_OF_SIGN[thirdCuspSign];
    const rulerEl = ELEMENT_OF_SIGN[thirdRulerSign];
    if (cuspEl && rulerEl && cuspEl !== rulerEl) {
      const friction = CLASH_FRICTION_BY_RULER_ELEMENT[rulerEl];
      const behavior = CLASH_BEHAVIOR_BY_RULER_ELEMENT[rulerEl];
      const houseClause = thirdRulerHouse ? ` running through ${HOUSE_THEME[thirdRulerHouse]}` : "";
      const surfaceArch = SURFACE_ARCHETYPE_BY_SIGN[thirdCuspSign] ?? "themselves";
      const absorbArch = ABSORPTION_ARCHETYPE_BY_SIGN[thirdRulerSign] ?? "an open channel";
      const line = `${chart.name} speaks ${thirdCuspSign}, but ${chart.name} processes like ${thirdRulerSign}. The surface tone everyone meets first is ${surfaceArch}; underneath, ${chart.name} absorbs like ${absorbArch}${houseClause}. The friction: ${friction}. In real life that means ${behavior}. If anyone responds only to the surface ${thirdCuspSign} tone, the ${thirdRulerSign} undercurrent stays clogged, and the next thing out of ${chart.name} is either a sudden silence or a sudden too-much.`;

      cognitiveClash = {
        cuspSign: thirdCuspSign,
        rulerName: thirdRulerName,
        rulerSign: thirdRulerSign,
        rulerHouse: thirdRulerHouse,
        friction,
        behavior,
        line,
      };
    }
  }

  // === TRANSLATION RULE 2: The Safety Valve (Mars-by-house) ===============
  // Name where the physical stress lands and the one daily release that keeps
  // ${name} sane. No "Mars represents..." fluff. Lead with the person and behavior.
  let energyDischarge: ChildPortrait["energyDischarge"] = undefined;
  if (marsSign && marsHouse && MARS_HOUSE_DISCHARGE[marsHouse]) {
    const m = MARS_HOUSE_DISCHARGE[marsHouse];
    const line = `${chart.name}'s stress lands in the ${ordinal(marsHouse)} house (${HOUSE_THEME[marsHouse]}), that is where the body carries it. The safety valve is ${m.action}. Skip the valve and the pressure leaks out as ${m.shadow}. ${chart.name} needs that release built into the day, not earned at the end of it.`;
    energyDischarge = { marsSign, marsHouse, action: m.action, shadow: m.shadow, line };
  }

  // === TRANSLATION RULE 3: The Internal Tug-of-War (tightest aspect <2.0°) ==
  let internalTugOfWar: ChildPortrait["internalTugOfWar"] = undefined;
  {
    const pool = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"];
    let best: { a: string; b: string; aspect: AspectName; orb: number } | null = null;
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const asp = aspectBetween(planets[pool[i]], planets[pool[j]]);
        if (!asp) continue;
        if (asp.orb >= 2.0) continue;
        if (!best || asp.orb < best.orb) {
          best = { a: pool[i], b: pool[j], aspect: asp.name, orb: asp.orb };
        }
      }
    }
    if (best) {
      const ORDER = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Chiron", "Uranus", "Neptune", "Pluto"];
      const [a, b] = ORDER.indexOf(best.a) <= ORDER.indexOf(best.b) ? [best.a, best.b] : [best.b, best.a];
      const aSign = planets[a]?.sign ?? "";
      const bSign = planets[b]?.sign ?? "";
      const goal = PLANET_GOAL[a] ?? "to express itself fully";
      const challenge = PLANET_CHALLENGE[b] ?? "an inner audit";
      const external = ASPECT_EXTERNAL_LINE[best.aspect];
      const internal = ASPECT_INTERNAL_LINE[best.aspect];
      const line = `${chart.name}'s tightest internal conversation is ${aSign} ${a} ${best.aspect} ${bSign} ${b} (orb ${best.orb.toFixed(1)}°). Our ${a} wants ${goal}, but our ${b} audits this with ${challenge}. From the outside it looks ${external}; on the inside, the two voices are actually ${internal}. The work is not to silence either side. It is to let ${a} lead first and let ${b} edit second, instead of the other way around.`;
      internalTugOfWar = { a, aSign, b, bSign, aspect: best.aspect, orb: best.orb, goal, challenge, external, internal, line };
    }
  }

  // === TRANSLATION RULE 4: Cloaking Time (personal planet or chart ruler in 12th) ==
  let cloakingNote: ChildPortrait["cloakingNote"] = undefined;
  {
    const found: Array<{ name: string; sign: string }> = [];
    for (const name of CLOAKING_BODIES) {
      const p = planets[name];
      if (!p?.sign) continue;
      if (houseOf(chart, p) === 12) found.push({ name, sign: p.sign });
    }
    if (chartRuler?.rulerHouse === 12 && !found.find(f => f.name === chartRuler!.rulerName)) {
      found.push({ name: chartRuler.rulerName + " (Chart Ruler)", sign: chartRuler.rulerSign });
    }
    if (found.length > 0) {
      const names = found.map(f => `${f.sign} ${f.name}`).join(", ");
      const line = `${chart.name} has a 12th-house cloaking signature: ${names}. We process in the dark before we process in public. What this means in practice: drafting, deciding, and feeling all need a private room first, and public exposure on these themes is a high-stress trigger, not a motivator. Schedule the alone time on purpose, before the room asks for the answer. Surprise spotlights on this material will read as a threat, even when the room means well.`;
      cloakingNote = { bodies: found, line };
    }
  }

  // === TRANSLATION RULE 5: The Pressure Signature ==========================
  // Triggers when the Chart Ruler (Captain) or Mars/Saturn (Engine) sits in
  // the 12th house, OR is in Scorpio, OR is in hard aspect to Pluto.
  // Names the felt internal pressure + the concrete consequence of denying
  // the cloaking need. Picks the tightest / most-loaded trigger.
  let pressureSignature: ChildPortrait["pressureSignature"] = undefined;
  {
    const pluto = planets["Pluto"];
    const captainName = chartRuler?.rulerName;
    const candidatesP: Array<{ name: string; trigger: "12th house" | "Scorpio" | "Pluto aspect"; priority: number }> = [];
    const considerBody = (name: string, isCaptain: boolean) => {
      const p = planets[name];
      if (!p?.sign) return;
      const h = houseOf(chart, p);
      // 12th house is the strongest pressure signal
      if (h === 12) candidatesP.push({ name, trigger: "12th house", priority: isCaptain ? 0 : 1 });
      // Scorpio placement is a permanent pressure-cooker
      else if (p.sign === "Scorpio") candidatesP.push({ name, trigger: "Scorpio", priority: isCaptain ? 2 : 3 });
      // Hard Pluto aspect is the active audit
      const asp = aspectBetween(p, pluto);
      if (asp && HARD_ASPECTS.includes(asp.name) && name !== "Pluto") {
        candidatesP.push({ name, trigger: "Pluto aspect", priority: (isCaptain ? 4 : 5) + asp.orb / 10 });
      }
    };
    if (captainName) considerBody(captainName, true);
    for (const e of PRESSURE_ENGINE_BODIES) {
      if (e !== captainName) considerBody(e, false);
    }
    candidatesP.sort((a, b) => a.priority - b.priority);
    const pick = candidatesP[0];
    if (pick) {
      const body = planets[pick.name];
      const bodySign = body?.sign ?? "";
      const bodyHouse = body ? houseOf(chart, body) : null;
      const needHouse = pick.trigger === "12th house" ? 12 : (bodyHouse ?? 12);
      const need = PRESSURE_NEED_BY_HOUSE[needHouse] ?? PRESSURE_NEED_BY_HOUSE[12];
      const needLabel = PRESSURE_NEED_LABEL_BY_HOUSE[needHouse] ?? "Cloaking Time";
      const consequence = marsSign
        ? (PRESSURE_CONSEQUENCE_BY_MARS_SIGN[marsSign] ?? "a total shutdown, the door closes and stays closed")
        : "a total shutdown, the door closes and stays closed";
      const roleLabel = pick.name === captainName ? "Captain (Chart Ruler)" : "Engine";
      const triggerClause =
        pick.trigger === "12th house"
          ? `their ${roleLabel} (${pick.name} in ${bodySign}) sits in the 12th house`
          : pick.trigger === "Scorpio"
          ? `their ${roleLabel} (${pick.name}) lives in Scorpio${bodyHouse ? ` in the ${ordinal(bodyHouse)} house` : ""}`
          : `their ${roleLabel} (${pick.name} in ${bodySign}${bodyHouse ? `, ${ordinal(bodyHouse)} house` : ""}) is in hard aspect to Pluto`;
      const line = `There is a massive internal world inside ${chart.name} that feels "too big" for the room, because ${triggerClause}. They aren't being quiet, shy, or withholding, they are actively managing an undercurrent in real time so it doesn't leak out as too much. The pressure is real and it is constant. If you don't provide ${needLabel}, meaning ${need}, the consequence isn't a polite ask twice: it's ${consequence}. Build the cloaking need into the schedule on purpose, before they have to ask for it, and the pressure stays workable instead of explosive.`;
      pressureSignature = {
        body: pick.name,
        bodySign,
        bodyHouse,
        trigger: pick.trigger,
        needLabel,
        need,
        consequence,
        line,
      };
    }
  }





  // === Real Talk (Decipher), attach a blunt 2-3 sentence translation
  // to each major synthesis block. Survival-strategy framing, "wise friend"
  // tone, no jargon. Uses already-computed sign/house data above.
  const N = chart.name;

  if (chartRuler) {
    const filter = RISING_FILTER[chartRuler.ascSign];
    const mask = SIGN_SURVIVAL_MASK[chartRuler.rulerSign] ?? "keep one foot near the exit";
    const payoff = SIGN_PAYOFF[chartRuler.rulerSign] ?? "in control";
    const stereo = filter?.stereotype ?? "what they look like on the surface";
    chartRuler.realTalk = `Real talk: ${N}'s ${chartRuler.ascSign} Rising isn't actually about being ${stereo}. They ${mask}, because the real prize is feeling ${payoff}. The surface is ${chartRuler.ascSign}; the engine running it is ${chartRuler.rulerName} in ${chartRuler.rulerSign}. Meet the engine, not the mask.`;
  }

  if (hiddenEngine) {
    const surfaceArch = SURFACE_ARCHETYPE_BY_SIGN[hiddenEngine.thirdSign] ?? "themselves";
    const absorbArch = ABSORPTION_ARCHETYPE_BY_SIGN[hiddenEngine.rulerSign] ?? "an open channel";
    hiddenEngine.realTalk = `Real talk: ${N} performs ${hiddenEngine.thirdSign} on the outside so people think they've got the read, but inside they're absorbing like ${absorbArch}. They look like ${surfaceArch}; they process like ${absorbArch}. The ${hiddenEngine.thirdSign} tone is a stall move, it buys time while the actual ${hiddenEngine.rulerSign} processor finishes the math. Don't argue with the surface; speak to the processor.`;
  }

  if (cognitiveClash) {
    const absorbArch = ABSORPTION_ARCHETYPE_BY_SIGN[cognitiveClash.rulerSign] ?? "an open channel";
    cognitiveClash.realTalk = `Real talk: when ${N} sounds ${cognitiveClash.cuspSign}, the ${cognitiveClash.rulerSign} inside is already two steps ahead. They aren't being inconsistent, they're using the surface tone to buy a few seconds while the actual ${cognitiveClash.rulerSign} read finishes loading. If you push the surface for an answer, you'll get a stall, not a lie.`;
  }

  if (coreConflict) {
    const desire = coreConflict.luminary === "Sun"
      ? (SUN_DESIRE_BY_SIGN[coreConflict.luminarySign] ?? "be themselves out loud")
      : (MOON_DESIRE_BY_SIGN[coreConflict.luminarySign] ?? "feel safe in their own skin");
    coreConflict.realTalk = `Real talk: ${N} isn't hesitant. They're scanning to make sure it's actually safe to ${desire}, because ${coreConflict.outerPlanet} keeps asking "are you allowed yet?" Once they decide they are, they move. The pause looks like fear; it's actually a permission check.`;
  }

  if (energyDischarge) {
    energyDischarge.realTalk = `Real talk: if ${N} doesn't burn off the ${energyDischarge.marsSign} fuel through ${energyDischarge.action}, the fuel doesn't disappear. It leaks out as ${energyDischarge.shadow}. The "mood" isn't a mood; it's unspent Mars looking for the door.`;
  }

  if (internalTugOfWar) {
    internalTugOfWar.realTalk = `Real talk: ${N} is running two true things at once. ${internalTugOfWar.a} wants the move; ${internalTugOfWar.b} wants to make sure the move doesn't cost them. The arguing isn't dysfunction, it's quality control. The fix is to let ${internalTugOfWar.a} go first, then let ${internalTugOfWar.b} edit the receipt, not the impulse.`;
  }

  if (cloakingNote) {
    cloakingNote.realTalk = `Real talk: public exposure on this material doesn't motivate ${N}. It threatens them. They have to process it in the dark first, then come back with the answer. Surprise spotlights read as ambush, even when the room means well.`;
  }

  if (pressureSignature) {
    const sign = pressureSignature.bodySign;
    pressureSignature.realTalk = `Real talk: ${N} is sitting on a ${sign} volcano. They need a door they can lock so they can decompress without ${pressureSignature.consequence}. It isn't about being shy or rude. It's about safety, theirs and yours.`;
  }

  if (saturnBlock) {
    const reason = SATURN_REAL_REASON[saturnBlock.sign] ?? "learned early that competence was the safest currency in the room";
    const payoff = SIGN_PAYOFF[saturnBlock.sign] ?? "in charge";
    saturnBlock.realTalk = `Real talk: this isn't a "struggle area." ${N} ${reason}, so the chase for feeling ${payoff} became the strategy. The mastery is letting that strategy retire when it isn't needed anymore, and letting someone else hold the weight without it costing them their identity.`;
  }

  if (chironBlock) {
    chironBlock.realTalk = `Real talk: the tender spot isn't broken. It's exactly where ${N} got extra fluent at reading other people, because they had to. The "wound" is also the antenna, don't try to remove it; protect it and use it on purpose.`;
  }

  // === No-Repeats Pass ====================================================
  // Banned-on-repeat: if any of these signature phrases appears more than once
  // across the assembled Portrait copy, the second+ occurrence is rewritten
  // into a fresh behavioral description. First occurrence is preserved.
  const BAN_ON_REPEAT: Array<{ pattern: RegExp; replacement: string }> = [
    {
      pattern: /freedom,\s*an open exit,\s*and a story large enough(?:\s*to live inside)?/gi,
      replacement: "the right to leave without a permission slip",
    },
    {
      pattern: /Zero Entanglements:[^.]+/g,
      replacement: "that same need to keep one door unlocked at all times",
    },
    {
      pattern: /scans the room as a [A-Z][a-z]+/g,
      replacement: "runs the same scan",
    },
    {
      pattern: /the nervous-system goal is [^.]+/g,
      replacement: "the same protection is running underneath",
    },
  ];
  function dedupeBannedPhrases<T>(node: T): T {
    if (typeof node === "string") {
      let out: string = node;
      for (const { pattern, replacement } of BAN_ON_REPEAT) {
        let first = true;
        out = out.replace(pattern, (match) => (first ? ((first = false), match) : replacement));
      }
      return out as unknown as T;
    }
    if (Array.isArray(node)) return node.map(dedupeBannedPhrases) as unknown as T;
    if (node && typeof node === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        result[k] = dedupeBannedPhrases(v);
      }
      return result as unknown as T;
    }
    return node;
  }
  // Cross-field dedupe: track each banned phrase globally across the whole Portrait,
  // keep only the first occurrence anywhere, replace later ones with the fallback.
  function dedupeAcrossPortrait<T>(node: T, seen: Set<number>): T {
    if (typeof node === "string") {
      let out: string = node;
      BAN_ON_REPEAT.forEach((rule, idx) => {
        out = out.replace(rule.pattern, (match) => {
          if (seen.has(idx)) return rule.replacement;
          seen.add(idx);
          return match;
        });
      });
      return out as unknown as T;
    }
    if (Array.isArray(node)) return node.map((n) => dedupeAcrossPortrait(n, seen)) as unknown as T;
    if (node && typeof node === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        result[k] = dedupeAcrossPortrait(v, seen);
      }
      return result as unknown as T;
    }
    return node;
  }



  // === Hard Banned Vocabulary =============================================
  // "Master Reset" rule: these words/phrases never appear in user-facing copy,
  // no matter which lookup table produced them. Replaced with real-world verbs.
  const HARD_BAN: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bhorizons?\b/gi,            replacement: "open road" },
    { pattern: /\bsacred\b/gi,               replacement: "protected" },
    { pattern: /\bcurriculum\b/gi,           replacement: "work" },
    { pattern: /\bunfolding\b/gi,            replacement: "happening" },
    { pattern: /\bmeaning[-\s]?makers?\b/gi, replacement: "sense-maker" },
    // Smooth dashes/quotes that drift in from templates.
    { pattern: /\s+,\s+/g,                   replacement: ", " },
  ];
  function scrubHardBan<T>(node: T): T {
    if (typeof node === "string") {
      let out: string = node;
      for (const { pattern, replacement } of HARD_BAN) out = out.replace(pattern, replacement);
      return out as unknown as T;
    }
    if (Array.isArray(node)) return node.map(scrubHardBan) as unknown as T;
    if (node && typeof node === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) result[k] = scrubHardBan(v);
      return result as unknown as T;
    }
    return node;
  }

  const assembled: any = {


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
    chartRuler,
    tightestAspects,
    moonPhaseProfile,
    nodeHouseSynthesis,
    howTo: { ritual, learningStyle, boundary },
    cognitiveProfile,
    cognitiveClash,
    energyDischarge,
    internalTugOfWar,
    cloakingNote,
    pressureSignature,

    venusPlacement: Venus?.sign ? { sign: Venus.sign, house: houseOf(chart, Venus), degree: Venus.degree ?? null, retrograde: !!(Venus as any).isRetrograde } : undefined,
    chironPlacement: Chiron?.sign ? { sign: Chiron.sign, house: houseOf(chart, Chiron), degree: Chiron.degree ?? null, retrograde: !!(Chiron as any).isRetrograde } : undefined,
    ascDegree: chart.houseCusps?.house1?.degree ?? null,
    twelfthHouseBodies: (() => {
      const out: Array<{ name: string; sign: string }> = [];
      for (const n of ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","Chiron"]) {
        const p = planets[n];
        if (p?.sign && houseOf(chart, p) === 12) out.push({ name: n, sign: p.sign });
      }
      return out.length ? out : undefined;
    })(),

    mathCheck: {
      thirdHouseSign: thirdCuspSign,
      thirdHouseRuler: thirdRulerName,
      thirdHouseRulerSign: thirdRulerSign,
      thirdHouseRulerHouse: thirdRulerHouse,
      sunAspects: sunAspects.slice(0, 6),
      moonAspects: moonAspects.slice(0, 6),
    },
  };
  // Apply Master Reset passes before returning: (1) drop banned vocabulary,
  // (2) de-duplicate signature phrases across the whole Portrait.
  // mathCheck is excluded to preserve raw debug data.
  const { mathCheck, ...textFields } = assembled;
  const scrubbed = scrubHardBan(textFields);
  const dedupedText = dedupeAcrossPortrait(scrubbed, new Set<number>());
  return { ...dedupedText, mathCheck };
}


