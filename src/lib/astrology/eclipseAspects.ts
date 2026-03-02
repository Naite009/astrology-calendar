import type { ZodiacSign } from "@/lib/astrology/signTeacher";

export type AspectType = "conjunction" | "opposition" | "square" | "trine" | "sextile";

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
];

function interpret(point: NatalPointKey, aspect: AspectType, eclipse: EclipseAspectEvent): string {
  const base =
    aspect === "conjunction" ? "Direct activation" :
    aspect === "opposition" ? "Relationship/axis tension and integration" :
    aspect === "square" ? "Pressure that forces adjustment" :
    aspect === "trine" ? "Support and flow (use it deliberately)" :
    "Opportunity that requires participation";

  const eclipseTone = eclipse.nodal === "south" ? "release/culmination" : "growth/initiating";

  return `${base}. Eclipse tone: ${eclipseTone}.`;
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
          glyph: `${POINT_GLYPHS[p.key]} ${ASPECT_GLYPHS[asp.type]}`,
        });
      }
    }
  }

  return hits.sort((a, b) => a.orbDeg - b.orbDeg).slice(0, limit);
}
