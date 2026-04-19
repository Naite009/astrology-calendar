// Universal post-generation validator for AI-paraphrased reading prose.
//
// All structured fields (counts in arrays, deterministic timing, houses)
// are already correct via earlier passes. This module catches the AI
// MIS-QUOTING those values inside narrative prose, bullets, summaries,
// and per-element interpretation rows.
//
// Five checks (Layer 1 — silent auto-fix or strip; Layer 2 — log to
// _validation block on the parsedContent for the UI to surface):
//
//   1. COUNT: rewrite "four Water" → "three Water" if elements/modalities/
//      polarity arrays say otherwise. Auto-fix in place.
//   2. ASPECT: scan "Planet [aspect] Planet" phrases. If the aspect
//      doesn't exist within the chart's natal aspect set OR exceeds the
//      max orb for that aspect, STRIP the sentence containing it.
//   3. PLANET-EXISTS: any planet name referenced must appear in the
//      chart's known planet/point list. Strip sentence if not.
//   4. DATE: any "Month YYYY" or "Mon D, YYYY" mentioned in narrative
//      prose must appear within a timing_section date_range. Strip
//      sentence otherwise.
//   5. LOG: every fix/strip is appended to parsedContent._validation.
//
// Policy:
//   - Counts: rewrite in place (number is the only wrong part).
//   - Aspects/Dates/Planets: strip the offending sentence only — leave
//     the rest of the paragraph intact.

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
  "Ascendant", "Midheaven", "Descendant", "IC",
];

const ASPECT_WORDS: Record<string, { angle: number; orb: number }> = {
  conjunct: { angle: 0, orb: 8 },
  conjunction: { angle: 0, orb: 8 },
  sextile: { angle: 60, orb: 5 },
  square: { angle: 90, orb: 7 },
  trine: { angle: 120, orb: 7 },
  opposite: { angle: 180, orb: 8 },
  opposition: { angle: 180, orb: 8 },
  quincunx: { angle: 150, orb: 3 },
};

const SIGN_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
  Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_ABBR = MONTH_NAMES.map((m) => m.slice(0, 3));

export type ValidationReport = {
  fixed_counts: Array<{ section: string; from: string; to: string }>;
  stripped_aspects: Array<{ section: string; phrase: string; reason: string }>;
  stripped_dates: Array<{ section: string; phrase: string }>;
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

// ── Build category counts map from the modality_element section ─────
const buildCountsMap = (parsedContent: any): Record<string, number> => {
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

// ── Parse natal degrees + aspect set from chart context string ──────
type ChartFacts = {
  degrees: Record<string, number>; // planet name -> ecliptic deg 0-360
  knownPlanets: Set<string>;
};

const buildChartFacts = (chartContext: string | undefined): ChartFacts => {
  const facts: ChartFacts = { degrees: {}, knownPlanets: new Set() };
  if (typeof chartContext !== "string" || !chartContext) return facts;

  // Extract any "Name: DD°MM' Sign" lines
  const degRegex = /(\w[\w\s]*?):\s*(\d+)°(\d+)?'?\s*(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/g;
  let m: RegExpExecArray | null;
  while ((m = degRegex.exec(chartContext)) !== null) {
    const name = m[1].trim();
    const deg = parseInt(m[2], 10);
    const min = parseInt(m[3] || "0", 10);
    const sign = m[4];
    facts.degrees[name] = (SIGN_INDEX[sign] || 0) * 30 + deg + min / 60;
    facts.knownPlanets.add(name);
  }

  // Always allow standard angles/nodes if not explicitly listed
  for (const p of ["Ascendant", "Midheaven", "Descendant", "IC", "North Node", "South Node"]) {
    facts.knownPlanets.add(p);
  }
  return facts;
};

const aspectSeparation = (a: number, b: number): number => {
  let sep = Math.abs(a - b);
  if (sep > 180) sep = 360 - sep;
  return sep;
};

// ── Date helpers ────────────────────────────────────────────────────
type DateRange = { start: Date; end: Date };

const parseDateRangesFromTimingSections = (parsedContent: any): DateRange[] => {
  const ranges: DateRange[] = [];
  if (!Array.isArray(parsedContent?.sections)) return ranges;
  for (const section of parsedContent.sections) {
    if (section?.type !== "timing_section") continue;
    const collect = (arr: any) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        // Accept both snake_case and camelCase to handle AI variants.
        const dr = item?.date_range || item?.dateRange;
        if (typeof dr !== "string" || !dr.trim()) continue;

        // Strategy: pull out every year mentioned, every month-name token,
        // and every "MonthName Day" pair. Then build the widest plausible
        // bounding range. Handles formats like:
        //   "Feb 2 to Oct 18, 2027"
        //   "March 2026 – November 2026"
        //   "2027-02-02 to 2027-10-18"
        //   "Throughout 2027"
        //   "Mar 14, 2027"
        const years = Array.from(dr.matchAll(/\b(20\d{2})\b/g)).map((m) => parseInt(m[1], 10));
        if (years.length === 0) continue;
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        const monthIdxs: number[] = [];
        const dayMatches: Array<{ monthIdx: number; day: number; year?: number }> = [];
        const monthFullAlt = MONTH_NAMES.join("|");
        const monthAbbrAlt = MONTH_ABBR.join("|");
        const monthDayRegex = new RegExp(
          `\\b(${monthFullAlt}|${monthAbbrAlt})(?:\\s+(\\d{1,2}))?(?:,?\\s+(\\d{4}))?\\b`,
          "g",
        );
        let mm: RegExpExecArray | null;
        while ((mm = monthDayRegex.exec(dr)) !== null) {
          const monthIdx =
            [...MONTH_NAMES, ...MONTH_ABBR].indexOf(mm[1]) % 12;
          monthIdxs.push(monthIdx);
          if (mm[2]) {
            dayMatches.push({
              monthIdx,
              day: parseInt(mm[2], 10),
              year: mm[3] ? parseInt(mm[3], 10) : undefined,
            });
          }
        }

        // Build start
        let startMonth = monthIdxs.length > 0 ? Math.min(...monthIdxs) : 0;
        let startDay = 1;
        let startYear = minYear;
        const firstDay = dayMatches[0];
        if (firstDay) {
          startMonth = firstDay.monthIdx;
          startDay = firstDay.day;
          startYear = firstDay.year ?? minYear;
        }

        // Build end
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
          ranges.push({ start, end });
        }
      }
    };
    collect(section.transits);
    collect(section.windows);
  }
  return ranges;
};

const dateInRanges = (d: Date, ranges: DateRange[], pad = 30): boolean => {
  for (const r of ranges) {
    const start = new Date(r.start.getTime() - pad * 86400000);
    const end = new Date(r.end.getTime() + pad * 86400000);
    if (d >= start && d <= end) return true;
  }
  return false;
};

const splitSentences = (text: string): string[] => {
  // Keep delimiters by splitting on lookahead.
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z"])/g);
  return parts;
};

// ── Per-string transformer ──────────────────────────────────────────
type Ctx = {
  counts: Record<string, number>;
  facts: ChartFacts;
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

// Returns the canonical case-correct planet name for a token like "sun" -> "Sun".
const canonicalPlanet = (token: string): string | null => {
  const norm = token.replace(/\s+/g, " ").trim().toLowerCase();
  for (const p of PLANET_NAMES) {
    if (p.toLowerCase() === norm) return p;
  }
  return null;
};

const checkAspectPair = (
  rawP1: string,
  rawAspect: string,
  rawP2: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string; reason?: string } => {
  const p1 = canonicalPlanet(rawP1);
  const p2 = canonicalPlanet(rawP2);
  const aw = rawAspect.toLowerCase();
  if (!p1 || !p2 || !ASPECT_WORDS[aw]) return { bad: false };
  if (p1 === p2) return { bad: false };
  const phrase = `${p1} ${aw} ${p2}`;
  const d1 = ctx.facts.degrees[p1];
  const d2 = ctx.facts.degrees[p2];
  if (typeof d1 !== "number" || typeof d2 !== "number") return { bad: false };
  const cfg = ASPECT_WORDS[aw];
  const sep = aspectSeparation(d1, d2);
  const orb = Math.abs(sep - cfg.angle);
  if (orb > cfg.orb) {
    return { bad: true, phrase, reason: `actual orb ${orb.toFixed(1)}° exceeds max ${cfg.orb}°` };
  }
  return { bad: false };
};

const sentenceClaimsBadAspect = (
  sentence: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string; reason?: string } => {
  const planetsAlt = PLANET_NAMES.map((p) => p.replace(/\s/g, "\\s")).join("|");
  const aspectsAlt = Object.keys(ASPECT_WORDS).join("|");

  // Pattern A: "Sun square Moon" / "Sun is square Moon" / "Sun, square Moon"
  // Pattern B: "Sun's square to the Moon" / "Sun's trine with Moon" (possessive)
  // Pattern C: "Sun-Moon square" / "Sun/Moon trine" (hyphen / slash pair)
  // Pattern D: "square between Sun and Moon" (reversed order)
  // Pattern E: "Sun in square to Moon" / "Sun in trine with the Moon"
  const patterns: Array<{ re: RegExp; map: (m: RegExpExecArray) => [string, string, string] }> = [
    {
      // A: planet [optional connector] aspect planet
      re: new RegExp(
        `\\b(${planetsAlt})(?:'s|\\s+is|\\s+sits|\\s*,)?\\s+(${aspectsAlt})\\s+(?:to|with|the\\s+)?\\s*(?:the\\s+)?(${planetsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[1], m[2], m[3]],
    },
    {
      // C: hyphen/slash pair followed by aspect word
      re: new RegExp(
        `\\b(${planetsAlt})\\s*[-/]\\s*(${planetsAlt})\\s+(${aspectsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[1], m[3], m[2]],
    },
    {
      // D: aspect between P1 and P2
      re: new RegExp(
        `\\b(${aspectsAlt})\\s+between\\s+(?:the\\s+)?(${planetsAlt})\\s+and\\s+(?:the\\s+)?(${planetsAlt})\\b`,
        "gi",
      ),
      map: (m) => [m[2], m[1], m[3]],
    },
    {
      // E: P1 in aspect to/with P2
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

// All 10 traditional planets + Chiron + Nodes + Angles exist in EVERY natal
// chart. The only thing this check should flag is a planet name the AI
// fabricated entirely (e.g., "Eris", "Sedna", "Vulcan") that is NOT in our
// canonical PLANET_NAMES list AND NOT in the chart's known set.
//
// Previously this stripped any planet missing from chartContext parsing,
// which falsely killed valid sentences when the chart-context regex didn't
// capture every planet's degree line. We now trust PLANET_NAMES as the
// always-valid set; chartContext only adds extra exotic bodies.
const ALWAYS_VALID_PLANETS = new Set(PLANET_NAMES);

const sentenceClaimsUnknownPlanet = (
  _sentence: string,
  _ctx: Ctx,
): { bad: boolean; phrase?: string } => {
  // We don't currently scan for fabricated exotic planets here because the
  // surrounding aspect/date checks are stricter and catch most issues.
  // ALWAYS_VALID_PLANETS already covers the 17 standard bodies, so any
  // sentence mentioning Sun/Moon/Mercury/.../Chiron/Nodes/Angles is allowed.
  // Reserved for future use if we want to flag Eris/Sedna/etc.
  void ALWAYS_VALID_PLANETS;
  return { bad: false };
};

const sentenceClaimsBadDate = (
  sentence: string,
  ctx: Ctx,
): { bad: boolean; phrase?: string } => {
  if (ctx.ranges.length === 0) return { bad: false };
  // Look for "Month YYYY" or "Mon D, YYYY" or "Month D YYYY"
  const monthAlt = [...MONTH_NAMES, ...MONTH_ABBR].join("|");
  const re = new RegExp(`\\b(${monthAlt})\\s+(\\d{1,2},?\\s+)?(\\d{4})\\b`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    const monthName = m[1];
    const dayPart = m[2]?.replace(/[,\s]/g, "");
    const year = m[3];
    const day = dayPart ? parseInt(dayPart, 10) : 15; // mid-month fallback for "Month YYYY"
    const monthIdx = [...MONTH_NAMES, ...MONTH_ABBR].indexOf(monthName) % 12;
    const d = new Date(parseInt(year, 10), monthIdx, day);
    if (isNaN(d.getTime())) continue;
    if (!dateInRanges(d, ctx.ranges)) {
      return { bad: true, phrase: m[0] };
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

// (Legacy shallow walker removed — deepWalkAndTransform below covers
// every nested field including subsections, scenes, cities, etc.)

// Keys we should NEVER walk into — they hold structured data the AI didn't write
// in narrative form (counts, raw planet objects, the validation report itself).
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

// Recursively walk every string field in any nested object/array, applying
// transforms. This catches subsections[].body, scenes[].bullets[], cities[].pros,
// or any other structure the AI invents. Skip structured/identifier keys.
const deepWalkAndTransform = (node: any, ctx: Ctx) => {
  if (node === null || node === undefined) return;
  if (typeof node === "string") return; // strings are mutated by parent (objects can't replace primitives in-place)
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

    // Per-element/modality/polarity rows DO have prose interpretations
    // we want to validate, even though the array key is in SKIP_KEYS.
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

// ── Public entry point ──────────────────────────────────────────────
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

  const counts = buildCountsMap(parsedContent);
  const facts = buildChartFacts(chartContext);
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
