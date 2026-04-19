import { extractValidationFacts, type ValidationFacts } from "./validationFacts.ts";

const NUMBER_WORDS: Record<number, string> = {
  0: "zero", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
  6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
};
const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

const KNOWN_CATEGORIES = new Set([
  "fire", "earth", "air", "water",
  "cardinal", "fixed", "mutable",
  "yang", "yin", "active", "receptive", "masculine", "feminine",
]);

const PLANET_NAMES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "Chiron", "North Node", "South Node",
  "Juno", "Lilith", "Ascendant", "Midheaven", "Descendant", "IC",
];

const PLANET_SYMBOLS: Record<string, string> = {
  "☉": "Sun",
  "☽": "Moon",
  "☿": "Mercury",
  "♀": "Venus",
  "♂": "Mars",
  "♃": "Jupiter",
  "♄": "Saturn",
  "♅": "Uranus",
  "♆": "Neptune",
  "♇": "Pluto",
  "⚷": "Chiron",
  "☊": "North Node",
  "☋": "South Node",
  "⚵": "Juno",
  "⚸": "Lilith",
};

const ASPECT_ALIASES: Record<string, string> = {
  conjunct: "conjunct",
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposite: "opposition",
  opposition: "opposition",
  quincunx: "quincunx",
  semisextile: "semisextile",
  semisquare: "semisquare",
  sesquiquadrate: "sesquiquadrate",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  "☌": "conjunct",
  "⚹": "sextile",
  "□": "square",
  "△": "trine",
  "☍": "opposition",
  "⚻": "quincunx",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = MONTH_NAMES.map((m) => m.slice(0, 3));

type DateRange = { start: Date; end: Date; source: string };

type ValidationFactsMap = {
  counts: Record<string, number>;
  aspectSet: Set<string>;
  positions: Record<string, number>;
  orbPolicy: Record<string, number>;
  knownPlanets: Set<string>;
};

export type ValidationReport = {
  fixed_counts: Array<{ section: string; from: string; to: string }>;
  stripped_aspects: Array<{ section: string; phrase: string; reason: string }>;
  stripped_dates: Array<{ section: string; phrase: string; reason: string }>;
  stripped_planets: Array<{ section: string; phrase: string }>;
  drift_count: number;
};

const emptyReport = (): ValidationReport => ({
  fixed_counts: [],
  stripped_aspects: [],
  stripped_dates: [],
  stripped_planets: [],
  drift_count: 0,
});

export const listAllowedNatalAspects = (chartContext: string | undefined): string[] => {
  const facts = buildFactsMap(chartContext);
  const out: string[] = [];
  for (const key of facts.aspectSet) {
    const [p1, aspect, p2] = key.split("|");
    if (!p1 || !p2 || !aspect) continue;
    out.push(`${p1} ${aspect} ${p2}`);
  }
  return out;
};

const stripPlural = (cat: string): string => {
  const lower = cat.toLowerCase();
  if (KNOWN_CATEGORIES.has(lower)) return lower;
  if (lower.endsWith("s") && KNOWN_CATEGORIES.has(lower.slice(0, -1))) {
    return lower.slice(0, -1);
  }
  return lower;
};

const formatNumberReplacement = (originalNum: string, actual: number): string => {
  if (/^\d+$/.test(originalNum)) return String(actual);
  const word = NUMBER_WORDS[actual] ?? String(actual);
  const isCapitalized = originalNum[0] === originalNum[0].toUpperCase();
  return isCapitalized ? word[0].toUpperCase() + word.slice(1) : word;
};

const buildCountsMapFromReading = (parsedContent: any): Record<string, number> => {
  const counts: Record<string, number> = {};
  if (!Array.isArray(parsedContent?.sections)) return counts;
  for (const section of parsedContent.sections) {
    if (section?.type !== "modality_element") continue;
    const collect = (arr: any) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!item || typeof item.name !== "string" || typeof item.count !== "number") continue;
        const lower = item.name.toLowerCase();
        counts[lower] = item.count;
        const firstWord = lower.split(/[\s(]/)[0];
        if (firstWord) counts[firstWord] = item.count;
      }
    };
    collect(section.elements);
    collect(section.modalities);
    collect(section.polarity);
  }
  return counts;
};

const buildCountsMapFromFacts = (facts: ValidationFacts | null): Record<string, number> => {
  if (!facts?.natal_counts) return {};
  const counts: Record<string, number> = {};
  const collect = (record?: Record<string, { count: number }>) => {
    if (!record) return;
    for (const [key, value] of Object.entries(record)) {
      if (!value || typeof value.count !== "number") continue;
      counts[key.toLowerCase()] = value.count;
    }
  };
  collect(facts.natal_counts.elements);
  collect(facts.natal_counts.modalities);
  collect(facts.natal_counts.polarity);
  return counts;
};

/**
 * Parse free-text "ACTIVE TRANSIT ASPECTS TO NATAL CHART" lines that AskView
 * injects into chartContext. Lines look like:
 *   "- Transiting Jupiter 12.4° Cancer ☌ Natal Sun 13.1° Cancer (orb: 0.7°) — conjunct"
 * We add every (transitPlanet, aspect, natalPlanet) pair to the allowlist
 * so the validator does not strip legitimate transit references that the AI
 * was explicitly given as ground truth.
 */
const collectTransitAspects = (chartContext: string | undefined, aspectSet: Set<string>) => {
  if (typeof chartContext !== "string" || !chartContext) return;
  const lines = chartContext.split("\n");
  const aspectsAlt = Object.keys(ASPECT_ALIASES).join("|");
  // Pattern: "Transiting <Planet> ... Natal <Planet> ... — <aspect>"
  const re = new RegExp(
    `Transiting\\s+([A-Z][A-Za-z ]+?)\\s+[\\d.]+.*?Natal\\s+([A-Z][A-Za-z ]+?)\\s+[\\d.]+.*?(?:—|--|-)\\s*(${aspectsAlt})\\b`,
    "i",
  );
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const p1 = canonicalPlanet(m[1].trim());
    const p2 = canonicalPlanet(m[2].trim());
    const aspect = ASPECT_ALIASES[m[3].toLowerCase()];
    if (!p1 || !p2 || !aspect) continue;
    const pair = [p1, p2].sort((a, b) => a.localeCompare(b));
    aspectSet.add(`${pair[0]}|${aspect}|${pair[1]}`);
  }
};

/**
 * Parse Solar Return / Progressed / Synastry sections that may also list
 * planet positions or aspects in plain text. For now we treat any pre-computed
 * "X aspect Y" claim found near these section headers as authoritative.
 */
const collectSecondaryChartAspects = (chartContext: string | undefined, aspectSet: Set<string>) => {
  if (typeof chartContext !== "string" || !chartContext) return;
  const aspectsAlt = Object.keys(ASPECT_ALIASES).join("|");
  // Generic line of the form "<Planet> <aspect> <Planet>" appearing AFTER a
  // header that mentions Solar Return, Progressed, Synastry or Composite.
  const sections = chartContext.split(/^---\s+/m);
  for (const block of sections) {
    if (!/SOLAR RETURN|PROGRESSED|SYNASTRY|COMPOSITE|DAVISON/i.test(block)) continue;
    const re = new RegExp(
      `\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\s+(${aspectsAlt})\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\b`,
      "gi",
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(block)) !== null) {
      const p1 = canonicalPlanet(m[1].trim());
      const p2 = canonicalPlanet(m[3].trim());
      const aspect = ASPECT_ALIASES[m[2].toLowerCase()];
      if (!p1 || !p2 || !aspect) continue;
      const pair = [p1, p2].sort((a, b) => a.localeCompare(b));
      aspectSet.add(`${pair[0]}|${aspect}|${pair[1]}`);
    }
  }
};

const buildFactsMap = (chartContext: string | undefined): ValidationFactsMap => {
  const parsed = extractValidationFacts(chartContext);
  const counts = buildCountsMapFromFacts(parsed);
  const knownPlanets = new Set(PLANET_NAMES);
  const positions: Record<string, number> = {};
  const aspectSet = new Set<string>();
  const orbPolicy = parsed?.natal_aspects_meta?.orb_policy ?? {};

  for (const position of parsed?.positions ?? []) {
    if (!position?.name || typeof position.abs_degree !== "number") continue;
    positions[position.name] = position.abs_degree;
    knownPlanets.add(position.name);
  }

  for (const aspect of parsed?.natal_aspects ?? []) {
    if (!aspect?.point1 || !aspect?.point2 || !aspect?.aspect) continue;
    const canonicalAspect = ASPECT_ALIASES[aspect.aspect.toLowerCase()] ?? aspect.aspect.toLowerCase();
    const pair = [aspect.point1, aspect.point2].sort((a, b) => a.localeCompare(b));
    aspectSet.add(`${pair[0]}|${canonicalAspect}|${pair[1]}`);
  }

  // Extend the allowlist with transit-to-natal aspects (pre-computed by AskView)
  // and any Solar Return / Progressed / Synastry aspects mentioned in headers.
  collectTransitAspects(chartContext, aspectSet);
  collectSecondaryChartAspects(chartContext, aspectSet);

  return { counts, aspectSet, positions, orbPolicy, knownPlanets };
};

/**
 * Parse a single date-range string into a {start, end} pair.
 *
 * Handles every format the AI emits in practice:
 *   - "Apr 19 to May 24, 2026"            (single year at end)
 *   - "Apr 19, 2026 to Oct 19, 2027"      (year on both sides)
 *   - "May 8–June 2, 2026"                (en-dash, no spaces)
 *   - "Feb 1–Apr 20, 2026"                (abbrev + en-dash)
 *   - "Nov 15 to Feb 10, 2027"            (YEAR ROLLOVER — start is prev year)
 *   - "Aug 7, 2026"                       (single date — treated as 1-day range)
 *
 * Year-rollover rule: if the first endpoint has NO explicit year and its
 * month is GREATER than the second endpoint's month, the range crosses a
 * year boundary, so the start year is (end year - 1).
 */
const MONTH_FULL_ALT = MONTH_NAMES.join("|");
const MONTH_ABBR_ALT = MONTH_ABBR.join("|");
const MONTH_DAY_REGEX = new RegExp(
  `\\b(${MONTH_FULL_ALT}|${MONTH_ABBR_ALT})(?:\\s+(\\d{1,2}))?(?:,?\\s+(\\d{4}))?\\b`,
  "g",
);
const ALL_MONTH_TOKENS = [...MONTH_NAMES, ...MONTH_ABBR];

const parseSingleRangeString = (raw: string): { start: Date; end: Date } | null => {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const years = Array.from(raw.matchAll(/\b(20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
  if (years.length === 0) return null;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const dayMatches: Array<{ monthIdx: number; day: number; year?: number }> = [];
  const monthIdxs: number[] = [];
  const re = new RegExp(MONTH_DAY_REGEX.source, "g");
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(raw)) !== null) {
    const monthIdx = ALL_MONTH_TOKENS.indexOf(mm[1]) % 12;
    monthIdxs.push(monthIdx);
    if (mm[2]) {
      dayMatches.push({
        monthIdx,
        day: parseInt(mm[2], 10),
        year: mm[3] ? parseInt(mm[3], 10) : undefined,
      });
    }
  }

  let startMonth = monthIdxs.length > 0 ? Math.min(...monthIdxs) : 0;
  let startDay = 1;
  let startYear = minYear;
  const firstDay = dayMatches[0];
  if (firstDay) {
    startMonth = firstDay.monthIdx;
    startDay = firstDay.day;
    startYear = firstDay.year ?? minYear;
  }

  let endMonth = monthIdxs.length > 0 ? Math.max(...monthIdxs) : 11;
  let endDay = 28;
  let endYear = maxYear;
  const lastDay = dayMatches[dayMatches.length - 1];
  if (lastDay) {
    endMonth = lastDay.monthIdx;
    endDay = lastDay.day;
    endYear = lastDay.year ?? maxYear;
  }

  // YEAR-ROLLOVER FIX: if the first endpoint had no explicit year AND its
  // month is greater than the last endpoint's month, the range crossed a
  // year boundary — start year is (end year - 1). Example: "Nov 15 to
  // Feb 10, 2027" → start = Nov 15 2026, end = Feb 10 2027.
  if (firstDay && firstDay.year === undefined && lastDay && firstDay.monthIdx > lastDay.monthIdx) {
    startYear = endYear - 1;
  }

  const start = new Date(startYear, startMonth, startDay);
  const end = new Date(endYear, endMonth, endDay);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  return { start, end };
};

/**
 * Build the "covered ranges" set from EVERY date-bearing field in the
 * timing section — not just `windows[].label`. Sources, in order:
 *   1. `transits[].date_range`        (the canonical AI field)
 *   2. `transits[].first_applying_date` → `transits[].separating_end_date`
 *      (synthesized range when `date_range` is missing or unparseable)
 *   3. `transits[].exact_hit_date`    (single-day range fallback)
 *   4. `windows[].label`              (most authoritative source for months)
 *   5. `windows[].dateRange.{start,end}` (structured ISO range when present)
 *
 * If we ONLY harvested `exact_hit_date`, bare-month claims like "May 2026"
 * would never line up with a single-day point and would always be stripped.
 * That was the original Paul-Howell bug.
 */
const parseDateRangesFromTimingSections = (parsedContent: any): DateRange[] => {
  const ranges: DateRange[] = [];
  if (!Array.isArray(parsedContent?.sections)) return ranges;

  const pushRange = (start: Date, end: Date, source: string) => {
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      ranges.push({ start, end, source });
    }
  };

  const harvestRangeString = (raw: unknown, source: string) => {
    if (typeof raw !== "string" || !raw.trim()) return false;
    const parsed = parseSingleRangeString(raw);
    if (parsed) {
      pushRange(parsed.start, parsed.end, source);
      return true;
    }
    return false;
  };

  for (const section of parsedContent.sections) {
    if (section?.type !== "timing_section") continue;

    if (Array.isArray(section.transits)) {
      for (const t of section.transits) {
        if (!t) continue;
        const got = harvestRangeString(t.date_range || t.dateRange, t.date_range || t.dateRange || "(transit date_range)");
        if (!got) {
          // Synthesize a range from applying/separating endpoints.
          const synth = `${t.first_applying_date ?? ""} to ${t.separating_end_date ?? ""}`.trim();
          if (t.first_applying_date && t.separating_end_date) {
            harvestRangeString(synth, synth);
          }
        }
        // ALSO register the exact hit as a 1-day point (covers narrow prose).
        if (typeof t.exact_hit_date === "string" && t.exact_hit_date.trim()) {
          const point = parseSingleRangeString(t.exact_hit_date);
          if (point) pushRange(point.start, point.end, t.exact_hit_date);
        }
      }
    }

    if (Array.isArray(section.windows)) {
      for (const w of section.windows) {
        if (!w) continue;
        // Prefer structured ISO range when present.
        const dr = w.dateRange ?? w.date_range;
        if (dr && typeof dr === "object" && typeof dr.start === "string" && typeof dr.end === "string") {
          const start = new Date(dr.start);
          const end = new Date(dr.end);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            pushRange(start, end, `${dr.start}..${dr.end}`);
            continue;
          }
        }
        harvestRangeString(w.label, w.label || "(window label)");
      }
    }
  }
  return ranges;
};

const findDateCoverage = (d: Date, ranges: DateRange[], pad = 30): { covered: boolean; reason: string } => {
  for (const r of ranges) {
    const start = new Date(r.start.getTime() - pad * 86400000);
    const end = new Date(r.end.getTime() + pad * 86400000);
    if (d >= start && d <= end) {
      return { covered: true, reason: `matched timing window \"${r.source}\"` };
    }
  }

  if (ranges.length === 0) {
    return { covered: false, reason: "no timing windows were available to verify this date" };
  }

  const nearest = [...ranges].sort((a, b) => {
    const aDistance = Math.min(Math.abs(d.getTime() - a.start.getTime()), Math.abs(d.getTime() - a.end.getTime()));
    const bDistance = Math.min(Math.abs(d.getTime() - b.start.getTime()), Math.abs(d.getTime() - b.end.getTime()));
    return aDistance - bDistance;
  })[0];

  return {
    covered: false,
    reason: `not backed by any timing window; nearest structured window is \"${nearest.source}\"`,
  };
};

/**
 * Bare-month references (e.g., "May 2026") must be backed by a structured
 * timing window that actually intersects that calendar month. We deliberately
 * do NOT apply the ±30-day pad here — otherwise a window like "Apr 1–30, 2026"
 * would falsely cover "May 2026". A pure month claim is only valid when at
 * least one structured window overlaps any day in that month.
 */
const findMonthCoverage = (
  year: number,
  monthIdx: number,
  ranges: DateRange[],
): { covered: boolean; reason: string } => {
  const monthStart = new Date(year, monthIdx, 1);
  const monthEnd = new Date(year, monthIdx + 1, 0);
  for (const r of ranges) {
    if (r.start <= monthEnd && r.end >= monthStart) {
      return { covered: true, reason: `month overlaps timing window \"${r.source}\"` };
    }
  }
  if (ranges.length === 0) {
    return { covered: false, reason: "no timing windows were available to verify this month" };
  }
  const nearest = [...ranges].sort((a, b) => {
    const mid = new Date(year, monthIdx, 15).getTime();
    const aDist = Math.min(Math.abs(mid - a.start.getTime()), Math.abs(mid - a.end.getTime()));
    const bDist = Math.min(Math.abs(mid - b.start.getTime()), Math.abs(mid - b.end.getTime()));
    return aDist - bDist;
  })[0];
  return {
    covered: false,
    reason: `bare-month claim not backed by any timing window; nearest structured window is \"${nearest.source}\"`,
  };
};

const splitSentences = (text: string): string[] => text.split(/(?<=[.!?])\s+(?=[A-Z"])/g);

type Ctx = {
  counts: Record<string, number>;
  facts: ValidationFactsMap;
  ranges: DateRange[];
  report: ValidationReport;
  sectionLabel: string;
};

type StripIssue = {
  phrase: string;
  reason: string;
};

const fixCountsInString = (text: string, ctx: Ctx): string => {
  if (!text || Object.keys(ctx.counts).length === 0) return text;
  const pattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|\d{1,2})(\s+)([A-Za-z]+)\b/gi;
  return text.replace(pattern, (match, numToken: string, gap: string, category: string) => {
    const root = stripPlural(category);
    const actual = ctx.counts[root] ?? ctx.counts[category.toLowerCase()];
    if (typeof actual !== "number") return match;
    const stated = /^\d+$/.test(numToken)
      ? parseInt(numToken, 10)
      : WORD_TO_NUMBER[numToken.toLowerCase()];
    if (stated === actual) return match;
    const replacement = formatNumberReplacement(numToken, actual);
    const fixed = `${replacement}${gap}${category}`;
    ctx.report.fixed_counts.push({ section: ctx.sectionLabel, from: match, to: fixed });
    return fixed;
  });
};

const canonicalPlanet = (token: string): string | null => {
  const symbolMatch = PLANET_SYMBOLS[token.trim()];
  if (symbolMatch) return symbolMatch;
  const norm = token.replace(/\s+/g, " ").trim().toLowerCase();
  for (const p of ctxSafePlanetNames) {
    if (p.toLowerCase() === norm) return p;
  }
  return null;
};

const ctxSafePlanetNames = [...PLANET_NAMES];

const checkAspectPair = (
  rawP1: string,
  rawAspect: string,
  rawP2: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string; reason?: string } => {
  const p1 = canonicalPlanet(rawP1);
  const p2 = canonicalPlanet(rawP2);
  const canonicalAspect = ASPECT_ALIASES[rawAspect.toLowerCase()];
  if (!p1 || !p2 || !canonicalAspect) return { bad: false };
  if (p1 === p2) return { bad: false };

  const pair = [p1, p2].sort((a, b) => a.localeCompare(b));
  const phrase = `${p1} ${canonicalAspect} ${p2}`;
  if (ctx.facts.aspectSet.has(`${pair[0]}|${canonicalAspect}|${pair[1]}`)) {
    return { bad: false };
  }

  if (typeof ctx.facts.positions[p1] === "number" && typeof ctx.facts.positions[p2] === "number") {
    return { bad: true, phrase, reason: `aspect is not present in natal_aspects source-of-truth` };
  }

  return { bad: false };
};

const collectBadAspectClaims = (
  sentence: string,
  ctx: Ctx,
): StripIssue[] => {
  const planetsAlt = ctxSafePlanetNames.map((p) => p.replace(/\s/g, "\\s")).join("|");
  const aspectsAlt = Object.keys(ASPECT_ALIASES).join("|");
  const symbolPlanetsAlt = Object.keys(PLANET_SYMBOLS).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const symbolAspectsAlt = Object.keys(ASPECT_SYMBOLS).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const patterns: Array<{ re: RegExp; map: (m: RegExpExecArray) => [string, string, string] }> = [
    {
      re: new RegExp(
        `\\b(${planetsAlt})(?:'s|\\s+is|\\s+sits|\\s*,)?\\s+(${aspectsAlt})\\s+(?:to|with|the\\s+)?\\s*(?:the\\s+)?(${planetsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[1], m[2], m[3]],
    },
    {
      re: new RegExp(
        `\\b(${planetsAlt})\\s*[-/]\\s*(${planetsAlt})\\s+(${aspectsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[1], m[3], m[2]],
    },
    {
      re: new RegExp(
        `\\b(${aspectsAlt})\\s+between\\s+(?:the\\s+)?(${planetsAlt})\\s+and\\s+(?:the\\s+)?(${planetsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[2], m[1], m[3]],
    },
    {
      re: new RegExp(
        `\\b(${planetsAlt})\\s+in\\s+(?:a\\s+|an\\s+)?(${aspectsAlt})\\s+(?:to|with)\\s+(?:the\\s+)?(${planetsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[1], m[2], m[3]],
    },
    {
      re: new RegExp(`(${symbolPlanetsAlt})\\s*(${symbolAspectsAlt})\\s*(${symbolPlanetsAlt})`, "g"),
      map: (m) => [m[1], ASPECT_SYMBOLS[m[2]] ?? m[2], m[3]],
    },
  ];

  const issues: StripIssue[] = [];
  const seen = new Set<string>();
  for (const { re, map } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(sentence)) !== null) {
      const [rawP1, rawAspect, rawP2] = map(match);
      const result = checkAspectPair(rawP1, rawAspect, rawP2, ctx);
      if (result.bad && result.phrase && result.reason) {
        const key = `${result.phrase}::${result.reason}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({ phrase: result.phrase, reason: result.reason });
        }
      }
    }
  }
  return issues;
};

const sentenceClaimsUnknownPlanet = (_sentence: string, _ctx: Ctx): { bad: boolean; phrase?: string } => ({ bad: false });

const collectBadDateClaims = (
  sentence: string,
  ctx: Ctx,
): StripIssue[] => {
  if (ctx.ranges.length === 0) return [];
  const monthAlt = [...MONTH_NAMES, ...MONTH_ABBR].join("|");
  const re = new RegExp(`\\b(${monthAlt})\\s+(\\d{1,2},?\\s+)?(\\d{4})\\b`, "g");
  const issues: StripIssue[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    const monthName = m[1];
    const dayPart = m[2]?.replace(/[,\s]/g, "");
    const year = m[3];
    const monthIdx = [...MONTH_NAMES, ...MONTH_ABBR].indexOf(monthName) % 12;
    const yearNum = parseInt(year, 10);

    // Bare-month claim ("May 2026") — must overlap a structured window
    // strictly within that calendar month, no ±30-day pad.
    if (!dayPart) {
      const coverage = findMonthCoverage(yearNum, monthIdx, ctx.ranges);
      if (!coverage.covered) {
        const key = `${m[0]}::${coverage.reason}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({ phrase: m[0], reason: coverage.reason });
        }
      }
      continue;
    }

    // Full date claim ("May 24, 2026") — allow ±30-day window padding.
    const d = new Date(yearNum, monthIdx, parseInt(dayPart, 10));
    if (isNaN(d.getTime())) continue;
    const coverage = findDateCoverage(d, ctx.ranges);
    if (!coverage.covered) {
      const key = `${m[0]}::${coverage.reason}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push({ phrase: m[0], reason: coverage.reason });
      }
    }
  }
  return issues;
};

const filterSentencesInString = (text: string, ctx: Ctx): string => {
  if (!text) return text;
  const sentences = splitSentences(text);
  const kept: string[] = [];
  for (const s of sentences) {
    const aspectIssues = collectBadAspectClaims(s, ctx);
    if (aspectIssues.length > 0) {
      ctx.report.stripped_aspects.push(
        ...aspectIssues.map((issue) => ({
          section: ctx.sectionLabel,
          phrase: issue.phrase,
          reason: issue.reason,
        })),
      );
      continue;
    }
    const planetCheck = sentenceClaimsUnknownPlanet(s, ctx);
    if (planetCheck.bad) {
      ctx.report.stripped_planets.push({
        section: ctx.sectionLabel,
        phrase: planetCheck.phrase!,
      });
      continue;
    }
    const dateIssues = collectBadDateClaims(s, ctx);
    if (dateIssues.length > 0) {
      ctx.report.stripped_dates.push(
        ...dateIssues.map((issue) => ({
          section: ctx.sectionLabel,
          phrase: issue.phrase,
          reason: issue.reason,
        })),
      );
      continue;
    }
    kept.push(s);
  }
  return kept.join(" ");
};

const transformString = (text: string, ctx: Ctx): string => {
  let out = fixCountsInString(text, ctx);
  out = filterSentencesInString(out, ctx);
  return out;
};

const SKIP_KEYS = new Set([
  "_validation",
  "_validation_warning",
  "elements",
  "modalities",
  "polarity",
  "transits",
  "windows",
  "date_range",
  "dateRange",
  "symbol",
  "tag",
  "type",
  "title",
  "label",
  "name",
  "planet",
  "aspect",
  "natal_point",
  "count",
  "generated_date",
]);

const deepWalkAndTransform = (node: any, ctx: Ctx) => {
  if (node === null || node === undefined) return;
  if (typeof node === "string") return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const child = node[i];
      if (typeof child === "string") {
        node[i] = transformString(child, ctx);
      } else if (child && typeof child === "object") {
        deepWalkAndTransform(child, ctx);
      }
    }
    return;
  }
  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      if (SKIP_KEYS.has(key)) continue;
      const v = node[key];
      if (typeof v === "string") {
        node[key] = transformString(v, ctx);
      } else if (v && typeof v === "object") {
        deepWalkAndTransform(v, ctx);
      }
    }

    for (const arrKey of ["elements", "modalities", "polarity"]) {
      const arr = node[arrKey];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (item && typeof item === "object" && typeof item.interpretation === "string") {
          item.interpretation = transformString(item.interpretation, ctx);
        }
      }
    }
  }
};

export const validateReading = (
  parsedContent: any,
  chartContext: string | undefined,
): ValidationReport => {
  const report = emptyReport();
  if (!parsedContent || !Array.isArray(parsedContent.sections)) {
    if (parsedContent && typeof parsedContent === "object") {
      parsedContent._validation = report;
    }
    return report;
  }

  const facts = buildFactsMap(chartContext);
  const counts = Object.keys(facts.counts).length > 0 ? facts.counts : buildCountsMapFromReading(parsedContent);
  const ranges = parseDateRangesFromTimingSections(parsedContent);

  for (const section of parsedContent.sections) {
    const label = `${section?.type || "unknown"}::${(section?.title || "").slice(0, 40)}`;
    const ctx: Ctx = { counts, facts, ranges, report, sectionLabel: label };
    deepWalkAndTransform(section, ctx);
  }

  report.drift_count =
    report.fixed_counts.length +
    report.stripped_aspects.length +
    report.stripped_dates.length +
    report.stripped_planets.length;

  parsedContent._validation = report;

  if (report.drift_count > 0) {
    console.warn(
      `[validateReading] drift_count=${report.drift_count}`,
      JSON.stringify(report),
    );
  } else {
    console.log("[validateReading] clean — no drift detected");
  }
  return report;
};
