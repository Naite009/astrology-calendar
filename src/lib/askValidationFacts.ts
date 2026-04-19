import { NatalChart } from "@/hooks/useNatalChart";

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

const POLARITY_MAP: Record<string, string> = {
  Aries: "Masculine", Taurus: "Feminine", Gemini: "Masculine", Cancer: "Feminine",
  Leo: "Masculine", Virgo: "Feminine", Libra: "Masculine", Scorpio: "Feminine",
  Sagittarius: "Masculine", Capricorn: "Feminine", Aquarius: "Masculine", Pisces: "Feminine",
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
    const polarity = POLARITY_MAP[point.sign];

    if (element) {
      elements[element].count += 1;
      elements[element].planets.push(point.name);
    }
    if (modality) {
      modalities[modality].count += 1;
      modalities[modality].planets.push(point.name);
    }
    if (polarity === "Masculine") {
      masculine.count += 1;
      masculine.planets.push(point.name);
    } else if (polarity === "Feminine") {
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
      Masculine: masculine,
      Feminine: feminine,
      Yang: { count: masculine.count, planets: [...masculine.planets] },
      Yin: { count: feminine.count, planets: [...feminine.planets] },
      Active: { count: masculine.count, planets: [...masculine.planets] },
      Receptive: { count: feminine.count, planets: [...feminine.planets] },
    },
    dominant_element: dominant(elements),
    dominant_modality: dominant(modalities),
    dominant_polarity: masculine.count >= feminine.count ? "Masculine" : "Feminine",
  };
};

export const buildAskValidationFactsBlock = (chart: NatalChart | null) => {
  if (!chart) return "";

  const positions = collectPointRecords(chart);
  if (positions.length === 0) return "";

  const facts = {
    version: 1,
    counted_planets: [...COUNTED_PLANETS],
    natal_counts: buildCounts(positions),
    natal_aspects: buildNatalAspects(positions),
    natal_aspects_meta: {
      orb_policy: Object.fromEntries(ASPECTS.map(({ aspect, orb }) => [aspect, orb])),
      house_system: "Placidus",
      zodiac: "tropical",
    },
    positions,
  };

  return [
    "",
    "--- VALIDATION FACTS (machine-readable) ---",
    ASK_VALIDATION_FACTS_START,
    JSON.stringify(facts, null, 2),
    ASK_VALIDATION_FACTS_END,
  ].join("\n");
};
