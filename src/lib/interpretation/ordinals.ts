/**
 * Canonical ordinal helpers.
 *
 * Every interpretation surface (portrait, patterns, PDFs, reports) must use these
 * instead of hand-writing `${n}th House`, which produced bugs like "2th House".
 */

export function ordinalSuffix(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const v = abs % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (abs % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", 13 -> "13th" */
export function ordinal(n: number): string {
  return `${Math.trunc(n)}${ordinalSuffix(n)}`;
}

/** 2 -> "2nd House" */
export function ordinalHouse(n: number, word: 'House' | 'house' = 'House'): string {
  return `${ordinal(n)} ${word}`;
}
