/**
 * Shared normalizer for AI-generated reading sections.
 *
 * Both the on-screen renderer (AskReadingRenderer) and the PDF exporter
 * (askPdfExport) consume the same StructuredReading payload, so any field
 * the AI omits would otherwise produce a blank UI element OR a blank PDF
 * card depending on which surface the user looks at.
 *
 * This module guarantees that every field rendered to the user is at least
 * a meaningful string — never empty, never whitespace, never a lone dash —
 * by synthesizing deterministic fallbacks from sibling fields when the AI
 * skips one. The original field is preserved when present and meaningful;
 * fallbacks ONLY kick in for blanks.
 *
 * NOTE: this is a render-side safety net. The AI prompt is still the
 * primary place to enforce required fields — this module exists so that a
 * single AI miss can never produce a blank card for the user.
 */

// ─── "Is this string actually empty?" ────────────────────────────────
// Mirrors `isEffectivelyEmpty` inside AskReadingRenderer so both surfaces
// agree on what counts as missing content.
export function isBlank(raw: unknown): boolean {
  if (raw == null) return true;
  if (typeof raw !== "string") return false;
  const cleaned = raw
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) return true;
  const stripped = cleaned.replace(/[\s\-–—•·.,:;…"'`*_()[\]{}]/g, "");
  if (stripped.length < 3) return true;
  const lower = cleaned.toLowerCase();
  const fillers = ["n/a", "tbd", "todo", "placeholder", "—", "...", "tba", "none", "null", "undefined"];
  return fillers.includes(lower);
}

// ─── City card normalization ─────────────────────────────────────────
//
// Critical fields for the city card visual:
//   • theme    — short summary line under the city name
//   • supports — green ✓ line
//   • cautions — red ⚠ line (only on caution cards; OK to leave blank
//                 on top-recommended cards — handled below)
//   • lines    — chart-basis tags
//   • explanation / why_it_works — long-form for expanded panel
//
// We synthesize fallbacks from the OTHER populated fields so the card
// stays visually balanced.

interface RawCity {
  name?: string;
  country?: string;
  region?: string;
  theme?: string;
  score?: number;
  mode?: string;
  tags?: string[];
  home_score?: number;
  career_score?: number;
  love_score?: number;
  healing_score?: number;
  vitality_score?: number;
  risk_score?: number;
  supports?: string;
  cautions?: string;
  explanation?: string;
  why_it_works?: string;
  tradeoffs?: string;
  best_for?: string;
  timeframe_notes?: string;
  mode_explainer?: string;
  lines?: string[];
  planetary_lines?: string[];
  [key: string]: unknown;
}

function tagsSummary(tags?: string[]): string {
  if (!Array.isArray(tags)) return "";
  const cleaned = tags.filter((t) => typeof t === "string" && !isBlank(t)).slice(0, 3);
  return cleaned.join(" · ");
}

function scoreLabel(score?: number): string {
  if (typeof score !== "number" || !isFinite(score)) return "";
  if (score >= 8) return "strong";
  if (score >= 6) return "supportive";
  if (score >= 4) return "mixed";
  return "challenging";
}

export function normalizeCity(rawCity: unknown): RawCity {
  const city: RawCity = { ...(rawCity as RawCity) };
  const name = typeof city.name === "string" ? city.name : "this city";

  // theme — the summary line under the name. This is the LA bug.
  if (isBlank(city.theme)) {
    const fallback =
      (!isBlank(city.supports) ? city.supports : "") ||
      tagsSummary(city.tags) ||
      (!isBlank(city.explanation) ? (city.explanation as string).split(/[.!?]/)[0]?.trim() : "") ||
      (!isBlank(city.why_it_works) ? (city.why_it_works as string).split(/[.!?]/)[0]?.trim() : "") ||
      `Overall ${scoreLabel(city.score) || "supportive"} match`;
    if (!isBlank(fallback)) {
      // eslint-disable-next-line no-console
      console.warn(`[normalizeCity] missing "theme" for "${name}" — using fallback: "${fallback}"`);
      city.theme = fallback;
    } else {
      city.theme = "Overall match";
    }
  }

  // supports — green ✓ line. If missing, synthesize from sub-scores.
  if (isBlank(city.supports)) {
    const subs: Array<[string, number | undefined]> = [
      ["home", city.home_score],
      ["career", city.career_score],
      ["love", city.love_score],
      ["healing", city.healing_score],
      ["vitality", city.vitality_score],
    ];
    const top = subs.filter(([, v]) => typeof v === "number" && (v as number) >= 7);
    if (top.length > 0) {
      city.supports = top.map(([k]) => k).join(", ");
      // eslint-disable-next-line no-console
      console.warn(`[normalizeCity] missing "supports" for "${name}" — derived from sub-scores: "${city.supports}"`);
    }
    // If no sub-scores either, leave it blank — the on-screen renderer
    // already conditionally hides this row, and the PDF skips it.
  }

  // explanation / why_it_works — at least one should exist for the
  // expanded detail panel. If neither, synthesize from theme + supports.
  if (isBlank(city.explanation) && isBlank(city.why_it_works)) {
    const parts: string[] = [];
    if (!isBlank(city.theme)) parts.push(city.theme as string);
    if (!isBlank(city.supports)) parts.push(`Strongest for ${city.supports}.`);
    if (!isBlank(city.cautions)) parts.push(`Watch for ${city.cautions}.`);
    if (parts.length > 0) {
      city.explanation = parts.join(" — ");
      // eslint-disable-next-line no-console
      console.warn(`[normalizeCity] missing "explanation" for "${name}" — synthesized from theme/supports`);
    }
  }

  // lines — chart-basis tags. If missing, synthesize a placeholder so the
  // card still has the chart-basis row populated.
  if ((!Array.isArray(city.lines) || city.lines.filter((l) => !isBlank(l)).length === 0) && city.mode) {
    const m = String(city.mode).toLowerCase();
    if (m.includes("astrology")) {
      city.lines = ["Chart-symbolism match"];
    }
  }

  return city;
}

// ─── Summary box items ───────────────────────────────────────────────
interface RawSummaryItem {
  label?: string;
  value?: string;
}

export function normalizeSummaryItem(item: unknown): RawSummaryItem | null {
  const it = (item ?? {}) as RawSummaryItem;
  const label = typeof it.label === "string" ? it.label.trim() : "";
  const value = typeof it.value === "string" ? it.value.trim() : "";
  // If both are blank, drop the item entirely — there's nothing to show.
  if (isBlank(label) && isBlank(value)) return null;
  // If only the value is blank, show a stable placeholder rather than a
  // bare label with nothing after it.
  if (isBlank(value)) {
    // eslint-disable-next-line no-console
    console.warn(`[normalizeSummaryItem] item "${label}" has empty value — using "Not specified"`);
    return { label, value: "Not specified" };
  }
  // If only the label is blank, hoist the value into the label so the
  // box doesn't render an orphan paragraph.
  if (isBlank(label)) {
    return { label: "Note", value };
  }
  return { label, value };
}

// ─── Narrative bullets ───────────────────────────────────────────────
interface RawBullet {
  label?: string;
  text?: string;
}

export function normalizeBullet(bullet: unknown): RawBullet | null {
  const b = (bullet ?? {}) as RawBullet;
  const text = typeof b.text === "string" ? b.text.trim() : "";
  const label = typeof b.label === "string" ? b.label.trim() : "";
  if (isBlank(text)) {
    // No salvage — bullets without text are noise. Drop.
    if (!isBlank(label)) {
      // eslint-disable-next-line no-console
      console.warn(`[normalizeBullet] dropping bullet "${label}" with empty text`);
    }
    return null;
  }
  return { label: isBlank(label) ? "Note" : label, text };
}
