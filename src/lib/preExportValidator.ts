/**
 * Pre-export validation pass.
 *
 * Runs over the FULL readings payload right before any export (JSON or PDF)
 * leaves Lovable. Enforces these rules:
 *
 *   1. Every transit must have: planet, aspect, natal_point, date_range,
 *      interpretation, symbol, tag — all non-empty after trimming.
 *      → On failure: THROW (these are critical and indicate generation broke).
 *
 *   2. Every window must have a non-empty label AND non-empty description.
 *      Description is checked against `description`, `body`, `text`, and
 *      `content` (some AI outputs use alternate field names).
 *      → On failure: SILENTLY DROP the window and log loudly. We never throw
 *      because a single empty window should not block the entire export —
 *      that produces a worse user experience than a slightly shorter report.
 *
 *   3. No two windows in the same timing section may share a label.
 *      Duplicates are merged in place (descriptions joined by a blank line).
 */

const REQUIRED_TRANSIT_FIELDS = [
  'planet',
  'aspect',
  'natal_point',
  'date_range',
  'interpretation',
  'symbol',
  'tag',
] as const;

import { normalizeLabelKey, dedupWindows } from './timingWindowDedup';

const isNonEmptyString = (v: unknown): boolean =>
  typeof v === 'string' && v.trim().length > 0;

export type PreExportFailure = {
  scope: 'transit' | 'window';
  readingIndex: number;
  sectionIndex: number;
  entryIndex: number;
  field: string;
  entry: unknown;
};

export class PreExportValidationError extends Error {
  failures: PreExportFailure[];
  constructor(failures: PreExportFailure[]) {
    const summary = failures
      .slice(0, 5)
      .map(
        (f) =>
          `${f.scope}#${f.entryIndex} (reading ${f.readingIndex}, section ${f.sectionIndex}) missing/empty "${f.field}"`,
      )
      .join('; ');
    super(
      `Pre-export validation failed (${failures.length} issue${failures.length === 1 ? '' : 's'}): ${summary}${failures.length > 5 ? '…' : ''}`,
    );
    this.name = 'PreExportValidationError';
    this.failures = failures;
  }
}

const EXPORT_SANITIZE_SKIP_SECTION_TYPES = new Set([
  'timing_section',
  'modality_element',
  'table_section',
  'data_table',
  'transit_table',
  'windows_section',
  'placement_table',
]);

const EXPORT_SANITIZE_SKIP_KEYS = new Set([
  'type', 'title', 'label', 'name', 'subtitle', 'heading', 'id', 'kind',
  'planet', 'sign', 'house', 'degrees', 'aspect', 'natal_point', 'symbol',
  'tag', 'date', 'date_range', 'dateRange', 'generated_date',
  'subject', 'question_type', 'question_asked', 'balance_interpretation',
  'windows', 'transits', 'items_meta',
]);

const EXPORT_ASPECT_KIND_REGEX = /\b(conjunction|conjunct|opposition|opposite|square|trine|sextile|quincunx|inconjunct|semisextile|semisquare|sesquisquare|sesquiquadrate|quintile|biquintile)\b/i;
const EXPORT_PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'North Node', 'South Node', 'Juno', 'Lilith', 'Ascendant', 'Descendant', 'Midheaven', 'IC',
];

const splitExportSentences = (text: string): string[] =>
  text
    .replace(/([.!?])\s+([A-Z][a-z]+\s+(?:conjunction|conjunct|opposition|opposite|square|trine|sextile|quincunx|inconjunct|semisextile|semisquare|sesquisquare|sesquiquadrate|quintile|biquintile)\s+[A-Z])/g, '$1\n$2')
    .replace(/([.!?])\s+(This is the South Node (?:pattern|default))/g, '$1\n$2')
    .split(/\n|(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);

const rewriteExportSentencePronouns = (sentence: string): string => {
  let s = sentence;
  s = s.replace(/Their drive runs into walls[\s\S]*?(?=(?:[.!?](?:\s|$))|$)/gi, "your drive runs into walls (usually your own internalized 'no') until you learn to push without burning out");
  s = s.replace(/(^|[—–\-:;]\s+)(Their)\b/g, (_m, lead) => `${lead}Your`);
  s = s.replace(/(^|[—–\-:;]\s+)(their)\b/g, (_m, lead) => `${lead}your`);
  s = s.replace(/(^|[—–\-:;]\s+)(They)\b/g, (_m, lead) => `${lead}You`);
  s = s.replace(/(^|[—–\-:;]\s+)(they)\b/g, (_m, lead) => `${lead}you`);
  s = s.replace(/\bpeople take them seriously\b/gi, 'people take you seriously');
  return s;
};

const normalizeExportSentence = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const getExportSentenceKey = (s: string): string | null => {
  const norm = normalizeExportSentence(s);
  if (norm.length < 25) return null;
  if (/^this is the south node (pattern|default)\b/.test(norm)) return 'south-node-pattern';
  return norm;
};

const buildExportAspectKey = (sentence: string): string | null => {
  const planetAlt = EXPORT_PLANET_NAMES.map((p) => p.replace(/\s+/g, '\\s+')).join('|');
  const re = new RegExp(`\\b(${planetAlt})\\b\\s+(${EXPORT_ASPECT_KIND_REGEX.source.replace(/^\\b|\\b$/g, '')})\\s+\\b(${planetAlt})\\b`, 'i');
  const m = sentence.match(re);
  if (!m) return null;
  const [a, b] = [m[1].toLowerCase(), m[3].toLowerCase()].sort();
  return `${a}|${m[2].toLowerCase()}|${b}`;
};

const sanitizeReadingForExport = (reading: { sections?: unknown[] }) => {
  const sections = Array.isArray(reading.sections) ? reading.sections : [];
  const firstSeenAspect = new Map<string, string>();
  const firstSeenSentence = new Map<string, string>();

  const cleanField = (text: string, sectionTitle: string): string => {
    if (!text || text.length < 20) return text;
    const sentences = splitExportSentences(text);
    const kept: string[] = [];
    let lastDropped = false;

    for (const raw of sentences) {
      const sent = rewriteExportSentencePronouns(raw);
      const aspectKey = buildExportAspectKey(sent);
      if (aspectKey) {
        if (firstSeenAspect.has(aspectKey)) {
          lastDropped = true;
          continue;
        }
        firstSeenAspect.set(aspectKey, sectionTitle);
        const sentenceKey = getExportSentenceKey(sent);
        if (sentenceKey) firstSeenSentence.set(sentenceKey, sectionTitle);
        kept.push(sent);
        lastDropped = false;
        continue;
      }

      const sentenceKey = getExportSentenceKey(sent);
      if (sentenceKey) {
        if (firstSeenSentence.has(sentenceKey)) {
          lastDropped = true;
          continue;
        }
        firstSeenSentence.set(sentenceKey, sectionTitle);
      }

      if (lastDropped && sent.length < 220) {
        lastDropped = false;
        continue;
      }

      lastDropped = false;
      kept.push(sent);
    }

    return kept.join(' ').trim();
  };

  const walk = (node: unknown, sectionTitle: string) => {
    if (Array.isArray(node)) {
      node.forEach((entry) => walk(entry, sectionTitle));
      return;
    }
    if (!node || typeof node !== 'object') return;
    Object.entries(node).forEach(([key, value]) => {
      if (EXPORT_SANITIZE_SKIP_KEYS.has(key)) return;
      if (typeof value === 'string') {
        const next = cleanField(value, sectionTitle);
        if (next !== value) (node as Record<string, unknown>)[key] = next;
        return;
      }
      if (value && typeof value === 'object') walk(value, sectionTitle);
    });
  };

  sections.forEach((section) => {
    if (!section || typeof section !== 'object') return;
    const typed = section as { type?: string; title?: string };
    if (EXPORT_SANITIZE_SKIP_SECTION_TYPES.has(String(typed.type || ''))) return;
    walk(section, String(typed.title || typed.type || 'section'));
  });
};

/**
 * Mutates the readings payload to merge duplicate-label windows, then throws
 * if any required-field rule is violated. Returns the same (possibly merged)
 * payload on success.
 */
export function validateAndPrepareReadingsForExport<T extends { sections?: unknown[] }>(
  readings: T[],
): T[] {
  const failures: PreExportFailure[] = [];

  readings.forEach((reading, readingIndex) => {
    sanitizeReadingForExport(reading);
    const sections = Array.isArray(reading?.sections) ? reading.sections : [];
    sections.forEach((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return;
      const s = section as { type?: string; transits?: unknown[]; windows?: unknown[] };
      if (s.type !== 'timing_section') return;

      // ── Rule 1: transit required fields ─────────────────────────────
      const transits = Array.isArray(s.transits) ? s.transits : [];
      transits.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object') {
          failures.push({
            scope: 'transit', readingIndex, sectionIndex, entryIndex,
            field: '(root)', entry,
          });
          return;
        }
        const obj = entry as Record<string, unknown>;
        for (const field of REQUIRED_TRANSIT_FIELDS) {
          if (!isNonEmptyString(obj[field])) {
            failures.push({
              scope: 'transit', readingIndex, sectionIndex, entryIndex,
              field, entry,
            });
          }
        }
      });

      // ── Rule 2 & 3: window required fields + dedup (shared helper) ─
      const windows = Array.isArray(s.windows) ? s.windows : [];

      // Diagnostic: log every raw window label + computed dedup key BEFORE merging.
      // eslint-disable-next-line no-console
      console.info(
        `[preExportValidator] Section ${sectionIndex} (reading ${readingIndex}) raw windows BEFORE dedup:`,
        windows.map((w, i) => {
          const o = (w && typeof w === 'object') ? (w as Record<string, unknown>) : {};
          const lbl = typeof o.label === 'string' ? o.label : '';
          return { i, label: lbl, key: lbl ? normalizeLabelKey(lbl) : '(empty)' };
        }),
      );

      // First pass — drop any window with empty label/description. We log
      // every drop with the full raw entry so we can diagnose alternate field
      // names or whitespace-only payloads (e.g. "Feb 2 to Oct 18, 2027" with
      // an empty body that previously slipped past).
      const cleanForDedup: Array<{ label: string; description: string; dateRange?: unknown }> = [];
      let droppedCount = 0;
      windows.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object') {
          droppedCount += 1;
          // eslint-disable-next-line no-console
          console.error(
            `[preExportValidator] 🛑 DROPPED window #${entryIndex} (reading ${readingIndex}, section ${sectionIndex}) — entry is not an object`,
            { entry },
          );
          return;
        }
        const obj = entry as Record<string, unknown>;

        // Pull label.
        const rawLabel = typeof obj.label === 'string' ? obj.label.trim() : '';

        // Pull description from any of the known field names. We accept
        // `description`, `body`, `text`, `content` — whichever is non-empty
        // wins. This guards against AI variants that rename the field.
        const descCandidates: Array<[string, unknown]> = [
          ['description', obj.description],
          ['body', obj.body],
          ['text', obj.text],
          ['content', obj.content],
        ];
        let resolvedDesc = '';
        let resolvedDescField = '';
        for (const [field, val] of descCandidates) {
          if (typeof val === 'string' && val.trim().length > 0) {
            resolvedDesc = val.trim();
            resolvedDescField = field;
            break;
          }
        }

        const labelOk = rawLabel.length > 0;
        const descOk = resolvedDesc.length > 0;

        if (!labelOk || !descOk) {
          droppedCount += 1;
          // eslint-disable-next-line no-console
          console.error(
            `[preExportValidator] 🛑 DROPPED empty window #${entryIndex} (reading ${readingIndex}, section ${sectionIndex})`,
            {
              labelEmpty: !labelOk,
              descEmpty: !descOk,
              rawLabel: obj.label,
              rawDescription: obj.description,
              rawBody: obj.body,
              rawText: obj.text,
              rawContent: obj.content,
              dateRange: obj.dateRange ?? obj.date_range,
              allKeys: Object.keys(obj),
              entry,
            },
          );
          return;
        }

        if (resolvedDescField !== 'description') {
          // eslint-disable-next-line no-console
          console.warn(
            `[preExportValidator] ⚠️ window #${entryIndex} description was resolved from "${resolvedDescField}" instead of "description". Normalizing.`,
          );
        }

        cleanForDedup.push({
          label: rawLabel,
          description: resolvedDesc,
          dateRange: obj.dateRange ?? obj.date_range,
        });
      });

      if (droppedCount > 0) {
        // eslint-disable-next-line no-console
        console.error(
          `[preExportValidator] Section ${sectionIndex} (reading ${readingIndex}): dropped ${droppedCount} empty window(s) before dedup.`,
        );
      }

      // Single source of truth for dedup — same helper used by the
      // deterministic builder and the edge function sanitizer.
      const dedupResult = dedupWindows(cleanForDedup);
      for (const stat of dedupResult.mergeStats) {
        if (stat.mergedCount > 1) {
          // eslint-disable-next-line no-console
          console.info(
            `[preExportValidator] ✅ MERGED duplicate window. Label="${stat.label}" key="${stat.key}" (reading ${readingIndex}, section ${sectionIndex}); merged count: ${stat.mergedCount}`,
          );
        }
      }
      const finalWindows = dedupResult.windows;

      // Diagnostic: log final deduped windows that will actually be exported.
      // eslint-disable-next-line no-console
      console.info(
        `[preExportValidator] Section ${sectionIndex} (reading ${readingIndex}) FINAL windows AFTER dedup (${finalWindows.length} of ${windows.length}):`,
        finalWindows.map((w) => w.label),
      );

      s.windows = finalWindows;
    });
  });

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[preExportValidator] BLOCKING EXPORT — validation failures', failures);
    throw new PreExportValidationError(failures);
  }

  return readings;
}
