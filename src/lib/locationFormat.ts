/**
 * Centralized location-string normalizer.
 *
 * PERMANENT RULE (applies to every chart, every reading, every export):
 * Any user-entered birth/relocation location string must be displayed and
 * passed downstream in title case, with US-style state codes (and other
 * 2-letter region codes) kept fully uppercase.
 *
 * Examples:
 *   "washington, dc"   → "Washington, DC"
 *   "new york, ny"     → "New York, NY"
 *   "LOS ANGELES, ca"  → "Los Angeles, CA"
 *   "san francisco"    → "San Francisco"
 *   "St. Louis, MO"    → "St. Louis, MO"   (preserved)
 *
 * This helper is the single source of truth used by:
 *   • the Ask edge function (prompt + JSON birth_info, see
 *     supabase/functions/ask-astrology/index.ts)
 *   • the chartContext builder in src/components/AskView.tsx
 *   • the PDF cover and Tier-1 report
 *   • the Replit JSON export pipeline
 *
 * Any new place that surfaces a location string MUST import from here
 * instead of re-implementing case logic.
 */

const SHORT_TOKEN_UPPERCASE = new Set([
  // US state codes are 2 letters; treat any 2-letter token as a code.
  // Common exceptions to title-casing rules:
  "DC", "DR", "ST", "MT", "PT", "FT",
  "USA", "UK", "UAE",
]);

const LOWERCASE_CONNECTORS = new Set([
  "of", "the", "and", "de", "del", "la", "le", "y",
]);

/**
 * Normalize a single token (word) inside a location string.
 * Rules:
 *   - 2-letter tokens → ALL CAPS (state codes like DC, NY, CA)
 *   - 3-letter tokens that look like country/region codes (USA, UAE, UK) → ALL CAPS
 *   - Connector words (of/the/and) → lowercase, except when first
 *   - Tokens with internal punctuation (St., O'Brien) → first letter cap, rest preserved
 *   - Default → first letter cap, rest lowercase
 */
const normalizeToken = (token: string, isFirstInPart: boolean): string => {
  if (!token) return token;
  // Already-uppercase short codes always stay uppercase.
  const stripped = token.replace(/[^A-Za-z]/g, "");
  if (stripped.length === 2) {
    return token.toUpperCase();
  }
  if (stripped.length === 3 && SHORT_TOKEN_UPPERCASE.has(stripped.toUpperCase())) {
    return token.toUpperCase();
  }
  const lower = token.toLowerCase();
  if (!isFirstInPart && LOWERCASE_CONNECTORS.has(lower)) {
    return lower;
  }
  // Preserve internal punctuation (St., O'Brien, etc.). Title-case each
  // alphabetic run inside the token.
  return token.replace(/[A-Za-z]+/g, (run, offset) => {
    if (run.length === 2) return run.toUpperCase();
    // For runs after a hyphen/apostrophe, also capitalize first letter.
    return run.charAt(0).toUpperCase() + run.slice(1).toLowerCase();
  });
};

/**
 * Normalize a full location string (e.g. "washington, dc" → "Washington, DC").
 * Splits on commas to handle "City, ST, Country" forms; each comma-separated
 * part is title-cased independently so the final segment (state/country)
 * still receives the 2-letter uppercase rule.
 */
export const formatLocationTitleCase = (raw: string | null | undefined): string => {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed
    .split(",")
    .map((part) => {
      const tokens = part.trim().split(/\s+/);
      return tokens.map((tok, i) => normalizeToken(tok, i === 0)).join(" ");
    })
    .join(", ");
};

/**
 * Convenience: in-place normalizer for any object with a `birthLocation`
 * (or similarly named) string field. Returns the same object reference for
 * chaining; mutates only when the input value changes.
 */
export const normalizeBirthLocationField = <T extends Record<string, any>>(
  obj: T,
  key: keyof T = "birthLocation" as keyof T,
): T => {
  if (!obj) return obj;
  const current = obj[key];
  if (typeof current === "string" && current.trim().length > 0) {
    const fixed = formatLocationTitleCase(current);
    if (fixed !== current) {
      obj[key] = fixed as any;
    }
  }
  return obj;
};