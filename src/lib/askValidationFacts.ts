import { NatalChart } from "@/hooks/useNatalChart";
import { lookupAspectMeaning } from "@/lib/aspectMeaningLibrary";

export const ASK_VALIDATION_FACTS_START = "VALIDATION_FACTS_JSON_START";
export const ASK_VALIDATION_FACTS_END = "VALIDATION_FACTS_JSON_END";

const ZODIAC = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const ELEMENT_MAP: Record<string, string> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

const MODALITY_MAP: Record<string, string> = {
  Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
  Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
  Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
};

// Planet-based polarity (NOT sign-based). A planet's intrinsic nature determines
// its Yang/Yin assignment, regardless of which sign it currently occupies.
// - Yang (active, outward, projecting): Sun, Mercury, Mars, Jupiter, Saturn, Uranus
//   (Mercury is traditionally classified as Yang/diurnal under Hellenistic sect —
//   it's a day planet, never far from the Sun, and its expression is outward.
//   Assigning it to Yang ensures the polarity totals always sum to 10 across the
//   counted planet set, fixing a prior off-by-one where Mercury was excluded.)
// - Yin (receptive, inward, magnetic): Moon, Venus, Neptune, Pluto
const PLANET_POLARITY: Record<string, "Yang" | "Yin"> = {
  Sun: "Yang",
  Mercury: "Yang",
  Mars: "Yang",
  Jupiter: "Yang",
  Saturn: "Yang",
  Uranus: "Yang",
  Moon: "Yin",
  Venus: "Yin",
  Neptune: "Yin",
  Pluto: "Yin",
};

const COUNTED_PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

const FACT_POINTS = [
  ...COUNTED_PLANETS,
  "Chiron",
  "North Node",
  "South Node",
  "Juno",
  "Lilith",
  "Ascendant",
  "Midheaven",
  "Descendant",
  "IC",
] as const;

// Match the project's centralized orb policy in aspectOrbs.ts:
// Luminaries 10°, Angles 9°, Planets 8°, Points 6°. We use the widest
// applicable orb (Luminary case) here so we don't strip legitimate wide
// natal aspects involving the Sun or Moon.
const ASPECTS = [
  { aspect: "conjunct", angle: 0, orb: 10 },
  { aspect: "sextile", angle: 60, orb: 6 },
  { aspect: "square", angle: 90, orb: 9 },
  { aspect: "trine", angle: 120, orb: 9 },
  { aspect: "quincunx", angle: 150, orb: 3 },
  { aspect: "opposition", angle: 180, orb: 10 },
  { aspect: "semisextile", angle: 30, orb: 2 },
  { aspect: "semisquare", angle: 45, orb: 2 },
  { aspect: "sesquiquadrate", angle: 135, orb: 2 },
] as const;

type SimplePosition = {
  sign: string;
  degree: number;
  minutes?: number;
  isRetrograde?: boolean;
};

type PointRecord = {
  name: string;
  sign: string;
  degree: number;
  minutes: number;
  abs_degree: number;
  house: number | null;
  is_retrograde: boolean;
};

const getAbsoluteDegree = (position: SimplePosition) => {
  const signIndex = ZODIAC.indexOf(position.sign as (typeof ZODIAC)[number]);
  if (signIndex < 0) return null;
  return signIndex * 30 + position.degree + (position.minutes || 0) / 60;
};

const buildHouseCalculator = (chart: NatalChart) => {
  const houseCusps = chart.houseCusps || {};
  const cuspLongitudes: number[] = [];

  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps] as SimplePosition | undefined;
    if (!cusp?.sign) return null;
    const abs = getAbsoluteDegree(cusp);
    if (abs == null) return null;
    cuspLongitudes.push(abs);
  }

  return (absDeg: number): number | null => {
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLongitudes[i];
      let end = cuspLongitudes[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return 1;
  };
};

const buildAnglePositions = (chart: NatalChart): Record<string, SimplePosition> => {
  const houseCusps = chart.houseCusps || {};
  const angles: Record<string, SimplePosition> = {};
  const mappings: Array<[string, keyof typeof houseCusps]> = [
    ["Ascendant", "house1"],
    ["IC", "house4"],
    ["Descendant", "house7"],
    ["Midheaven", "house10"],
  ];

  for (const [name, key] of mappings) {
    const cusp = houseCusps[key] as SimplePosition | undefined;
    if (cusp?.sign) {
      angles[name] = { sign: cusp.sign, degree: cusp.degree, minutes: cusp.minutes || 0 };
      continue;
    }
    const fallback = chart.planets?.[name as keyof typeof chart.planets] as SimplePosition | undefined;
    if (fallback?.sign) {
      angles[name] = fallback;
    }
  }

  return angles;
};

const collectPointRecords = (chart: NatalChart) => {
  const planets = chart.planets || {};
  const calcHouse = buildHouseCalculator(chart);
  const anglePositions = buildAnglePositions(chart);
  const records: PointRecord[] = [];
  const seen = new Set<string>();

  const addPoint = (name: string, position?: SimplePosition) => {
    if (!position?.sign || seen.has(name)) return;
    const abs = getAbsoluteDegree(position);
    if (abs == null) return;
    records.push({
      name,
      sign: position.sign,
      degree: position.degree,
      minutes: position.minutes || 0,
      abs_degree: abs,
      house: calcHouse ? calcHouse(abs) : null,
      is_retrograde: Boolean(position.isRetrograde),
    });
    seen.add(name);
  };

  for (const point of FACT_POINTS) {
    if (point === "Ascendant" || point === "Midheaven" || point === "Descendant" || point === "IC") {
      addPoint(point, anglePositions[point]);
      continue;
    }
    addPoint(point, planets[point as keyof typeof planets] as SimplePosition | undefined);
  }

  return records;
};

const aspectSeparation = (a: number, b: number) => {
  let separation = Math.abs(a - b) % 360;
  if (separation > 180) separation = 360 - separation;
  return separation;
};

const buildNatalAspects = (points: PointRecord[]) => {
  const aspects: Array<{ point1: string; point2: string; aspect: string; orb: number; separation: number }> = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];
      const separation = aspectSeparation(p1.abs_degree, p2.abs_degree);
      let best: { aspect: string; orb: number; separation: number } | null = null;

      for (const candidate of ASPECTS) {
        const orb = Math.abs(separation - candidate.angle);
        if (orb > candidate.orb) continue;
        if (!best || orb < best.orb) {
          best = { aspect: candidate.aspect, orb: Number(orb.toFixed(2)), separation: Number(separation.toFixed(2)) };
        }
      }

      if (best) {
        aspects.push({ point1: p1.name, point2: p2.name, ...best });
      }
    }
  }

  return aspects;
};

const buildCounts = (points: PointRecord[]) => {
  const elements: Record<string, { count: number; planets: string[] }> = {
    Fire: { count: 0, planets: [] },
    Earth: { count: 0, planets: [] },
    Air: { count: 0, planets: [] },
    Water: { count: 0, planets: [] },
  };
  const modalities: Record<string, { count: number; planets: string[] }> = {
    Cardinal: { count: 0, planets: [] },
    Fixed: { count: 0, planets: [] },
    Mutable: { count: 0, planets: [] },
  };
  const masculine = { count: 0, planets: [] as string[] };
  const feminine = { count: 0, planets: [] as string[] };

  for (const point of points) {
    if (!COUNTED_PLANETS.includes(point.name as (typeof COUNTED_PLANETS)[number])) continue;
    const element = ELEMENT_MAP[point.sign];
    const modality = MODALITY_MAP[point.sign];
    // Polarity is derived from the PLANET itself, not the sign it occupies.
    // Mercury is assigned to Yang (Hellenistic diurnal classification) so that
    // Yang + Yin always sums to 10 across the 10 counted planets.
    const polarity = PLANET_POLARITY[point.name];

    if (element) {
      elements[element].count += 1;
      elements[element].planets.push(point.name);
    }
    if (modality) {
      modalities[modality].count += 1;
      modalities[modality].planets.push(point.name);
    }
    if (polarity === "Yang") {
      masculine.count += 1;
      masculine.planets.push(point.name);
    } else if (polarity === "Yin") {
      feminine.count += 1;
      feminine.planets.push(point.name);
    }
  }

  const dominant = <T extends Record<string, { count: number }>>(record: T) =>
    Object.entries(record).sort((a, b) => b[1].count - a[1].count)[0]?.[0] ?? null;

  return {
    elements,
    modalities,
    polarity: {
      // Primary planet-based polarity counts.
      Yang: { count: masculine.count, planets: [...masculine.planets] },
      Yin: { count: feminine.count, planets: [...feminine.planets] },
      // Aliases retained so existing prompt vocabulary still resolves.
      Active: { count: masculine.count, planets: [...masculine.planets] },
      Receptive: { count: feminine.count, planets: [...feminine.planets] },
      Masculine: { count: masculine.count, planets: [...masculine.planets] },
      Feminine: { count: feminine.count, planets: [...feminine.planets] },
    },
    dominant_element: dominant(elements),
    dominant_modality: dominant(modalities),
    dominant_polarity: masculine.count >= feminine.count ? "Yang" : "Yin",
  };
};

export const buildAskValidationFactsBlock = (chart: NatalChart | null) => {
  if (!chart) return "";

  const positions = collectPointRecords(chart);
  if (positions.length === 0) return "";

  const natalAspects = buildNatalAspects(positions);

  const facts = {
    version: 1,
    counted_planets: [...COUNTED_PLANETS],
    natal_counts: buildCounts(positions),
    natal_aspects: natalAspects,
    natal_aspects_meta: {
      orb_policy: Object.fromEntries(ASPECTS.map(({ aspect, orb }) => [aspect, orb])),
      house_system: "Placidus",
      zodiac: "tropical",
    },
    positions,
  };

  // Build a prominent, human-readable allowlist so the AI treats this as
  // primary source data — not buried metadata. Sort by tightest orb first,
  // and show planet/sign/degree on each side so the AI never has to infer.
  // Each line ALSO carries the verified behavioral meaning of the aspect
  // (when in our meaning library) so the AI writes interpretation from
  // accurate raw material instead of pattern-matching to archetypes.
  const posByName = new Map(positions.map((p) => [p.name, p]));
  const sortedAspects = [...natalAspects].sort((a, b) => a.orb - b.orb);
  const aspectLines = sortedAspects.map((a) => {
    const p1 = posByName.get(a.point1);
    const p2 = posByName.get(a.point2);
    const fmt = (p: typeof positions[number] | undefined) =>
      p ? `${p.name} ${p.degree}°${String(p.minutes).padStart(2, "0")}' ${p.sign}` : a.point1;
    const base = `- ${fmt(p1)} ${a.aspect} ${fmt(p2)} (orb ${a.orb.toFixed(2)}°)`;
    const meaning = lookupAspectMeaning(a.point1, a.point2, a.aspect);
    return meaning ? `${base}\n    MEANING: ${meaning}.` : base;
  });

  const humanReadableBlock = [
    "",
    "=== VERIFIED NATAL ASPECTS — AUTHORITATIVE SOURCE-OF-TRUTH ===",
    "These are the ONLY natal aspects in this chart. They were computed deterministically from the exact ecliptic positions above using the project's centralized orb policy.",
    "Each aspect that has a verified MEANING line carries the authoritative behavioral interpretation for that pair + aspect type. When you reference this aspect in any narrative section, you MUST write your prose so it conveys the lived experience described in the MEANING line. Do NOT contradict the MEANING line. Do NOT replace the meaning with generic archetypal language (e.g., do not describe an opposition as flowing or a trine as friction). Use the MEANING as your source of truth for the FEELING of the aspect, then translate it into recognizable, lived language for the reader.",
    "ABSOLUTE RULE: You MAY ONLY name a natal aspect (in any narrative_section, summary_box, placement_table, or anywhere else in the response) if it appears verbatim in this list. If a natal aspect is NOT in this list, it does NOT EXIST. Do NOT infer, estimate, or reason from sign relationships.",
    "If you want to claim a synthesis like 'Jupiter trine Venus' or 'Saturn opposition Pluto', search this list first — if you do not find that exact pair + aspect, replace it with one that IS in the list, or describe the dynamic in non-aspect language (placements, house themes).",
    "",
    aspectLines.join("\n") || "(no natal aspects within orb policy)",
    "=== END VERIFIED NATAL ASPECTS ===",
    "",
  ].join("\n");

  return [
    humanReadableBlock,
    "--- VALIDATION FACTS (machine-readable) ---",
    ASK_VALIDATION_FACTS_START,
    JSON.stringify(facts, null, 2),
    ASK_VALIDATION_FACTS_END,
  ].join("\n");
};
