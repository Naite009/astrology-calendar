/**
 * SHARED (Deno mirror) — Timing window label normalization + dedup.
 *
 * BYTE-IDENTICAL MIRROR of `src/lib/timingWindowDedup.ts`. Deno edge functions
 * cannot import from `src/`, so this mirror exists to keep both runtimes on
 * the same logic. If you change one, change the other in the same commit.
 *
 * Used by:
 *   - supabase/functions/ask-astrology/index.ts → sanitizeDeterministicTiming
 */

const MONTH_MAP: Record<string, string> = {
  january: 'jan', february: 'feb', march: 'mar', april: 'apr',
  may: 'may', june: 'jun', july: 'jul', august: 'aug',
  september: 'sep', sept: 'sep', october: 'oct', november: 'nov', december: 'dec',
};

const MONTH_REGEX = /\b(january|february|march|april|may|june|july|august|september|sept|october|november|december)\b/g;

export function normalizeLabelKey(label: string): string {
  let s = label.toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(MONTH_REGEX, (m) => MONTH_MAP[m] ?? m);
  s = s.replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1');
  s = s.replace(/\s+to\s+/g, '-').replace(/\s*[–—-]\s*/g, '-');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function dateRangeKey(dr: unknown): string | null {
  if (!dr || typeof dr !== 'object') return null;
  const obj = dr as { start?: unknown; end?: unknown };
  const start = typeof obj.start === 'string' ? obj.start.slice(0, 10) : '';
  const end = typeof obj.end === 'string' ? obj.end.slice(0, 10) : '';
  if (!start || !end) return null;
  return `daterange:${start}__${end}`;
}

export type WindowEntry = {
  label: string;
  description: string;
  dateRange?: unknown;
};

export type MergedWindow = { label: string; description: string };

export type DedupResult = {
  windows: MergedWindow[];
  mergedCount: number;
  mergeStats: Array<{ key: string; label: string; mergedCount: number }>;
};

export function dedupWindows(rawWindows: readonly WindowEntry[]): DedupResult {
  const map = new Map<string, { label: string; description: string; mergedCount: number; key: string; seenDescs: Set<string> }>();

  for (const entry of rawWindows) {
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const description = typeof entry.description === 'string' ? entry.description.trim() : '';
    if (!label || !description) continue;

    const key = dateRangeKey(entry.dateRange) ?? `label:${normalizeLabelKey(label)}`;
    const existing = map.get(key);
    if (existing) {
      const norm = description.toLowerCase().replace(/\s+/g, ' ');
      if (existing.seenDescs.has(norm)) {
        existing.mergedCount += 1;
        continue;
      }
      const existingNorm = existing.description.toLowerCase().replace(/\s+/g, ' ');
      if (existingNorm.includes(norm) || norm.includes(existingNorm)) {
        existing.seenDescs.add(norm);
        existing.mergedCount += 1;
        continue;
      }
      existing.seenDescs.add(norm);
      existing.description = `${existing.description}\n\n${description}`;
      existing.mergedCount += 1;
    } else {
      const norm = description.toLowerCase().replace(/\s+/g, ' ');
      map.set(key, { label, description, mergedCount: 1, key, seenDescs: new Set([norm]) });
    }
  }

  const dedupeSentencesInline = (text: string): string => {
    const parts = text.split(/(?<=[.!?])\s+|\n\n+/).map((s) => s.trim()).filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of parts) {
      const k = p.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(p);
    }
    return out.join(' ');
  };

  const merged = Array.from(map.values());
  const totalMerged = merged.reduce((sum, m) => sum + (m.mergedCount - 1), 0);

  return {
    windows: merged.map(({ label, description }) => ({ label, description: dedupeSentencesInline(description) })),
    mergedCount: totalMerged,
    mergeStats: merged.map(({ key, label, mergedCount }) => ({ key, label, mergedCount })),
  };
}
