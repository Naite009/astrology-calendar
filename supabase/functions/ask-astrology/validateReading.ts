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

  return { counts, aspectSet, positions, orbPolicy, knownPlanets };
};

const parseDateRangesFromTimingSections = (parsedContent: any): DateRange[] => {
  const ranges: DateRange[] = [];
  if (!Array.isArray(parsedContent?.sections)) return ranges;

  const monthFullAlt = MONTH_NAMES.join("|");
  const monthAbbrAlt = MONTH_ABBR.join("|");
  const monthDayRegex = new RegExp(
    `\\b(${monthFullAlt}|${monthAbbrAlt})(?:\\s+(\\d{1,2}))?(?:,?\\s+(\\d{4}))?\\b`,
    "g",
  );

  for (const section of parsedContent.sections) {
    if (section?.type !== "timing_section") continue;
    const collect = (arr: any) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        const raw = item?.date_range || item?.dateRange || item?.label;
        if (typeof raw !== "string" || !raw.trim()) continue;

        const years = Array.from(raw.matchAll(/\b(20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
        if (years.length === 0) continue;
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        const monthIdxs: number[] = [];
        const dayMatches: Array<{ monthIdx: number; day: number; year?: number }> = [];
        let mm: RegExpExecArray | null;
        while ((mm = monthDayRegex.exec(raw)) !== null) {
          const monthIdx = [...MONTH_NAMES, ...MONTH_ABBR].indexOf(mm[1]) % 12;
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

        const start = new Date(startYear, startMonth, startDay);
        const end = new Date(endYear, endMonth, endDay);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          ranges.push({ start, end, source: raw });
        }
      }
    };

    collect(section.transits);
    collect(section.windows);
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

const sentenceClaimsBadAspect = (
  sentence: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string; reason?: string } => {
  const planetsAlt = ctxSafePlanetNames.map((p) => p.replace(/\s/g, "\\s")).join("|");
  const aspectsAlt = Object.keys(ASPECT_ALIASES).join("|");
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
  ];

  for (const { re, map } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(sentence)) !== null) {
      const [rawP1, rawAspect, rawP2] = map(match);
      const result = checkAspectPair(rawP1, rawAspect, rawP2, ctx);
      if (result.bad) return result;
    }
  }
  return { bad: false };
};

const sentenceClaimsUnknownPlanet = (_sentence: string, _ctx: Ctx): { bad: boolean; phrase?: string } => ({ bad: false });

const sentenceClaimsBadDate = (
  sentence: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string; reason?: string } => {
  if (ctx.ranges.length === 0) return { bad: false };
  const monthAlt = [...MONTH_NAMES, ...MONTH_ABBR].join("|");
  const re = new RegExp(`\\b(${monthAlt})\\s+(\\d{1,2},?\\s+)?(\\d{4})\\b`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    const monthName = m[1];
    const dayPart = m[2]?.replace(/[,\s]/g, "");
    const year = m[3];
    const day = dayPart ? parseInt(dayPart, 10) : 15;
    const monthIdx = [...MONTH_NAMES, ...MONTH_ABBR].indexOf(monthName) % 12;
    const d = new Date(parseInt(year, 10), monthIdx, day);
    if (isNaN(d.getTime())) continue;
    const coverage = findDateCoverage(d, ctx.ranges);
    if (!coverage.covered) {
      return { bad: true, phrase: m[0], reason: coverage.reason };
    }
  }
  return { bad: false };
};

const filterSentencesInString = (text: string, ctx: Ctx): string => {
  if (!text) return text;
  const sentences = splitSentences(text);
  const kept: string[] = [];
  for (const s of sentences) {
    const aspectCheck = sentenceClaimsBadAspect(s, ctx);
    if (aspectCheck.bad) {
      ctx.report.stripped_aspects.push({
        section: ctx.sectionLabel,
        phrase: aspectCheck.phrase!,
        reason: aspectCheck.reason!,
      });
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
    const dateCheck = sentenceClaimsBadDate(s, ctx);
    if (dateCheck.bad) {
      ctx.report.stripped_dates.push({
        section: ctx.sectionLabel,
        phrase: dateCheck.phrase!,
        reason: dateCheck.reason!,
      });
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
