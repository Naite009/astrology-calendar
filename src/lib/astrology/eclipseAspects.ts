import type { ZodiacSign } from "@/lib/astrology/signTeacher";

export type AspectType = "conjunction" | "opposition" | "square" | "trine" | "sextile" | "quincunx" | "semisextile";

export type NatalPointKey =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"
  | "Chiron" | "ASC" | "MC" | "NorthNode" | "SouthNode";

export type NatalPoint = {
  key: NatalPointKey;
  sign: ZodiacSign;
  degree: number;
  minutes?: number;
};

export type EclipseAspectEvent = {
  sign: ZodiacSign;
  degree: number;
  minutes: number;
  nodal: "north" | "south";
  type: "solar" | "lunar";
};

export type AspectHit = {
  point: NatalPointKey;
  aspect: AspectType;
  orbDeg: number;
  orbLabel: string;
  interpretation: string;
  glyph: string;
  feltSense: string;
  northNodePath: string;
  isMinor: boolean;
};

const SIGN_ORDER: ZodiacSign[] = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const ASPECT_GLYPHS: Record<AspectType, string> = {
  conjunction: "☌",
  opposition: "☍",
  square: "□",
  trine: "△",
  sextile: "⚹",
  quincunx: "⚻",
  semisextile: "⚺",
};

const POINT_GLYPHS: Record<NatalPointKey, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", ASC: "AC", MC: "MC", NorthNode: "☊", SouthNode: "☋",
};

function toAbsoluteDegrees(sign: ZodiacSign, degree: number, minutes = 0): number {
  return SIGN_ORDER.indexOf(sign) * 30 + degree + minutes / 60;
}

function normalizeDelta(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function degToLabel(d: number): string {
  const deg = Math.floor(d);
  const min = Math.round((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

const ASPECTS: { type: AspectType; angle: number; orb: number }[] = [
  { type: "conjunction", angle: 0, orb: 3 },
  { type: "opposition", angle: 180, orb: 3 },
  { type: "square", angle: 90, orb: 2.5 },
  { type: "trine", angle: 120, orb: 2.5 },
  { type: "sextile", angle: 60, orb: 2 },
  { type: "quincunx", angle: 150, orb: 3 },
  { type: "semisextile", angle: 30, orb: 2 },
];

/** Deep planet-in-life descriptions */
const PLANET_LIFE_MEANING: Record<NatalPointKey, string> = {
  Sun: "your core identity — who you are when you stop performing for others",
  Moon: "your emotional operating system — what you need to feel safe, and the habits you default to under stress",
  Mercury: "how you think, process information, and make daily decisions",
  Venus: "what you value, how you attach in relationships, and your relationship with money and pleasure",
  Mars: "how you assert yourself, handle conflict, and channel desire and anger",
  Jupiter: "where you seek growth, meaning, and what you believe is possible for you",
  Saturn: "where you feel the weight of responsibility, your fear of failure, and the structures you've built to feel safe",
  Uranus: "where you need freedom, resist conformity, and experience sudden disruption",
  Neptune: "where you idealize, lose clarity, or tap into something transcendent",
  Pluto: "where you hold power (or feel powerless), your relationship with control, and what you'd rather not look at",
  Chiron: "your core wound — the place where you teach others what you're still learning yourself",
  ASC: "how the world sees you, your automatic first impression, and the mask you wear",
  MC: "your public role, career path, and what you're building in the world",
  NorthNode: "your growth direction — the unfamiliar territory that represents your soul's curriculum this lifetime",
  SouthNode: "your default setting — the familiar patterns that feel safe but keep you circling",
};

/** What each aspect type actually does to a natal planet */
const ASPECT_ACTIVATION: Record<AspectType, string> = {
  conjunction: "fuses with — directly charges and amplifies this part of your chart, making it impossible to ignore",
  opposition: "confronts — creates tension between your inner experience and external circumstances, forcing awareness",
  square: "pressures — creates friction that demands you do something different; the discomfort is the catalyst",
  trine: "supports — opens a door that's easy to walk through, but you still have to consciously choose to walk through it",
  sextile: "offers an opportunity — a gentle invitation that rewards initiative but doesn't force anything",
  quincunx: "creates an awkward misalignment — two parts of your life that don't naturally understand each other are forced into conversation, requiring creative adjustment",
  semisextile: "sends a subtle signal from adjacent territory — easy to dismiss as background noise, but this quiet knock keeps returning until you open the door",
};

/** How each aspect type tends to feel in the body/psyche */
const ASPECT_FELT_SENSE: Record<AspectType, (planet: NatalPointKey) => string> = {
  conjunction: (p) => `You may feel ${p === 'Moon' ? 'emotionally flooded' : p === 'Saturn' ? 'heavy pressure' : p === 'Mars' ? 'restless urgency' : p === 'Venus' ? 'heightened desire or dissatisfaction with what you have' : p === 'Pluto' ? 'something surfacing that you\'ve been keeping buried' : p === 'Neptune' ? 'disoriented, like the ground is shifting' : p === 'Chiron' ? 'an old wound reopening' : 'a strong pull to pay attention to this area'} — it's loud and hard to ignore.`,
  opposition: (p) => `It may show up as an external event or person reflecting back something about your ${p === 'Moon' ? 'emotional patterns' : p === 'Venus' ? 'relationship dynamics' : p === 'Saturn' ? 'authority or responsibility' : p === 'Pluto' ? 'power dynamics' : 'inner landscape'} that you can't see from the inside.`,
  square: (p) => `Expect friction — ${p === 'Moon' ? 'emotional restlessness or anxiety that demands attention' : p === 'Saturn' ? 'a structure that stops working and forces rebuilding' : p === 'Mars' ? 'frustration or anger that signals something needs to change' : p === 'Venus' ? 'tension between what you want and what you currently have' : p === 'Pluto' ? 'a power struggle — with yourself or someone else' : 'pressure in this area that won\'t let you stay comfortable'}. The discomfort is the point.`,
  trine: (p) => `This feels like a green light — ${p === 'Moon' ? 'emotional clarity and ease' : p === 'Venus' ? 'things clicking into place in relationships or finances' : p === 'Jupiter' ? 'an expanding sense of possibility' : 'natural flow in this area'}. The risk is taking it for granted and letting the opportunity pass unused.`,
  sextile: (p) => `A gentle nudge — ${p === 'Mercury' ? 'a conversation or idea that opens a door' : p === 'Venus' ? 'a social connection or creative spark worth pursuing' : p === 'Jupiter' ? 'an optimistic opening' : 'a small opening that rewards action'}. Easy to miss if you're not paying attention.`,
  quincunx: (p) => `This feels off — like ${p === 'Moon' ? 'your emotional needs and your daily reality aren\'t matching up' : p === 'Pluto' ? 'something powerful is pulling at you from an angle you can\'t quite name' : p === 'Saturn' ? 'your responsibilities and your deeper truth are speaking different languages' : p === 'Venus' ? 'what you value and what you\'re actually doing feel disconnected' : 'two important parts of your life are talking past each other'}. There's no clean resolution — only creative adaptation.`,
  semisextile: (p) => `This is quiet — ${p === 'Pluto' ? 'a background awareness that something transformative is nearby, like a low hum you keep noticing' : p === 'Moon' ? 'small emotional signals that something adjacent to your routine needs attention' : p === 'Saturn' ? 'a subtle structural adjustment that\'s easy to postpone but keeps nudging' : 'a whisper from an adjacent life area that seems unrelated but keeps connecting'}. Don't dismiss it.`,
};

/** Generate North Node conscious path guidance based on the planet being activated */
function getNorthNodePathForPlanet(point: NatalPointKey, aspect: AspectType, eclipse: EclipseAspectEvent): string {
  const isRelease = eclipse.nodal === "south";
  
  const paths: Partial<Record<NatalPointKey, { release: string; grow: string }>> = {
    Moon: {
      release: "Notice where your emotional habits are running on autopilot — the comfort-seeking, the retreat into familiar patterns. This eclipse asks you to let those habits complete their cycle rather than clinging to them.",
      grow: "Practice sitting with unfamiliar emotions instead of reaching for your default comfort strategy. The new emotional territory feels wrong precisely because it's new — that discomfort is the growth signal.",
    },
    Venus: {
      release: "Look at what you're holding onto for security — possessions, relationships, financial patterns — and ask whether they're serving your growth or just your anxiety.",
      grow: "Invest your energy and resources in what genuinely matters to your future self, even if it means letting go of something that feels comfortable right now.",
    },
    Mars: {
      release: "Notice where you're fighting battles that no longer serve you, or where your anger is protecting something that needs to change.",
      grow: "Channel your drive toward the unfamiliar goal — the one that scares you a little. That's where your energy wants to go.",
    },
    Saturn: {
      release: "The structures and rules you've built may have kept you safe, but some of them are now walls instead of scaffolding. Let them come down.",
      grow: "Build new structures that support where you're going, not where you've been. This requires tolerating the vulnerability of construction-in-progress.",
    },
    Pluto: {
      release: "Something you've been controlling — or that's been controlling you — is ready to transform. Stop gripping. The death of this pattern is the birth of the next one.",
      grow: "Step into the power that comes from letting go, not from holding on. Real transformation requires surrender before it offers strength.",
    },
    Neptune: {
      release: "Where have you been living in a fantasy or avoiding reality? This eclipse dissolves illusions — let clarity emerge, even if what you see isn't what you hoped.",
      grow: "Trust the intuitive signal, but ground it in action. Spiritual insight without practical follow-through is just another form of avoidance.",
    },
    Jupiter: {
      release: "Let go of the belief that more = better. Growth for growth's sake can become its own trap.",
      grow: "Expand deliberately — toward the specific opportunity this eclipse is illuminating, not just in every direction at once.",
    },
    Chiron: {
      release: "Stop performing your wound. The identity built around 'the one who was hurt' has an expiration date.",
      grow: "Let the healing happen imperfectly. You don't have to understand the wound completely before you start living beyond it.",
    },
    Sun: {
      release: "The version of yourself you've been performing may need to die so the real one can emerge. Let it.",
      grow: "Show up as who you actually are — not who you've learned to be. The eclipse is illuminating the gap between the two.",
    },
    Mercury: {
      release: "Notice the thought loops and mental habits that keep you in familiar territory. The way you've been thinking about this situation may be the problem.",
      grow: "Seek new information, new conversations, new perspectives — especially from sources that challenge your existing framework.",
    },
    NorthNode: {
      release: "This is a direct call to your growth path. Everything about this eclipse is pointing you forward.",
      grow: "Lean into the discomfort of your North Node territory. This eclipse is accelerating your soul curriculum — say yes to it.",
    },
    SouthNode: {
      release: "The past is completing. Thank it, honor what it taught you, and stop returning to it.",
      grow: "Every time you catch yourself defaulting to the old pattern, gently redirect toward the opposite — your North Node.",
    },
    ASC: {
      release: "The way you present yourself to the world — your automatic persona, your first impression — is ready for an update. The mask that once protected you may now be hiding you.",
      grow: "Step into a more authentic self-presentation. How you show up in the world is shifting — let the new version emerge rather than clinging to the familiar public face.",
    },
    MC: {
      release: "Your career path or public role may be completing a chapter. The professional identity you've built may need to evolve — not because it failed, but because you've outgrown it.",
      grow: "Your public direction is being recalibrated. Lean into the career or life-direction changes that feel right even if they don't match the plan you had five years ago.",
    },
  };

  const entry = paths[point];
  if (entry) return isRelease ? entry.release : entry.grow;
  return isRelease 
    ? "This eclipse is clearing old energy from this part of your chart — let the release happen."
    : "This eclipse is activating new growth in this area — lean into it consciously.";
}

function interpret(point: NatalPointKey, aspect: AspectType, eclipse: EclipseAspectEvent): string {
  const planetMeaning = PLANET_LIFE_MEANING[point];
  const activation = ASPECT_ACTIVATION[aspect];
  const eclipseTone = eclipse.nodal === "south" ? "release and completion" : "growth and initiation";
  
  return `This eclipse ${activation}. In your chart, ${point} represents ${planetMeaning}. Eclipse tone: ${eclipseTone}.`;
}

function getFeltSense(point: NatalPointKey, aspect: AspectType): string {
  return ASPECT_FELT_SENSE[aspect](point);
}

function getNorthNodeGuidance(point: NatalPointKey, aspect: AspectType, eclipse: EclipseAspectEvent): string {
  return getNorthNodePathForPlanet(point, aspect, eclipse);
}

export function getEclipseAspectHits(
  eclipse: EclipseAspectEvent,
  natalPoints: NatalPoint[],
  limit = 3
): AspectHit[] {
  const eAbs = toAbsoluteDegrees(eclipse.sign, eclipse.degree, eclipse.minutes);
  const hits: AspectHit[] = [];

  for (const p of natalPoints) {
    const pAbs = toAbsoluteDegrees(p.sign, p.degree, p.minutes ?? 0);
    const delta = normalizeDelta(eAbs, pAbs);

    for (const asp of ASPECTS) {
      const orbDeg = Math.abs(delta - asp.angle);
      if (orbDeg <= asp.orb) {
        hits.push({
          point: p.key,
          aspect: asp.type,
          orbDeg,
          orbLabel: degToLabel(orbDeg),
          interpretation: interpret(p.key, asp.type, eclipse),
          feltSense: getFeltSense(p.key, asp.type),
          northNodePath: getNorthNodeGuidance(p.key, asp.type, eclipse),
          glyph: `${POINT_GLYPHS[p.key]} ${ASPECT_GLYPHS[asp.type]}`,
          isMinor: asp.type === "quincunx" || asp.type === "semisextile",
        });
      }
    }
  }

  return hits.sort((a, b) => a.orbDeg - b.orbDeg).slice(0, limit);
}

export function getProximityBadge(
  eclipse: EclipseAspectEvent,
  natalPoints: NatalPoint[] | null
): string | null {
  if (!natalPoints || natalPoints.length === 0) return null;
  const top = getEclipseAspectHits(eclipse, natalPoints, 1)[0];
  if (!top) return null;
  return `${top.orbLabel} from ${top.point}`;
}
