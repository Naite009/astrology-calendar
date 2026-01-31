// Local (timezone-safe) date helpers.
// Use these when a date represents a *calendar day* for the user (not an exact moment).

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date *without* timezone shifting.
 * We intentionally construct a local Date from parts.
 */
export function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Format a YYYY-MM-DD string for display without timezone shifting.
 */
export function formatLocalDateLong(
  dateKey: string,
  locale: string = 'en-US'
): string {
  return parseLocalDate(dateKey).toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
