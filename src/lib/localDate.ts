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

/**
 * Format any date string (YYYY-MM-DD or MM-DD-YYYY or MM/DD/YYYY) into MM-DD-YYYY display format.
 * This is the project-wide standard for all date displays.
 */
export function formatDateMMDDYYYY(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[-/]/);
    let year: string, month: string, day: string;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parts[0];
      month = String(parseInt(parts[1], 10)).padStart(2, '0');
      day = String(parseInt(parts[2], 10)).padStart(2, '0');
    } else {
      // MM-DD-YYYY or MM/DD/YYYY
      month = String(parseInt(parts[0], 10)).padStart(2, '0');
      day = String(parseInt(parts[1], 10)).padStart(2, '0');
      year = parts[2];
    }
    return `${month}-${day}-${year}`;
  } catch {
    return dateStr;
  }
}
