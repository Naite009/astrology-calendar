// Name matching utilities for linking charts to profiles

/**
 * Normalize a name for comparison:
 * - lowercase
 * - trim whitespace
 * - remove extra spaces
 * - remove common prefixes/suffixes (Jr., III, etc.)
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/[.,]/g, '') // remove punctuation
    .replace(/\b(jr|sr|ii|iii|iv|v|phd|md|esq)\b/gi, '') // remove suffixes
    .trim();
}

/**
 * Check if two names likely refer to the same person
 * Handles:
 * - Exact match after normalization
 * - First name + last name vs full name
 * - Nickname variations
 */
export function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (!n1 || !n2) return false;
  
  // Exact match
  if (n1 === n2) return true;
  
  // One contains the other (handles "John" matching "John Smith")
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Compare first names only (common case: user enters first name in one place, full name in another)
  const parts1 = n1.split(' ');
  const parts2 = n2.split(' ');
  
  if (parts1[0] === parts2[0]) {
    // First names match - likely same person
    return true;
  }
  
  return false;
}

/**
 * Find the best matching chart for a given name
 */
export function findMatchingChart<T extends { name: string }>(
  targetName: string,
  charts: T[]
): T | null {
  if (!targetName || !charts.length) return null;
  
  // First try exact match
  const exactMatch = charts.find(c => 
    normalizeName(c.name) === normalizeName(targetName)
  );
  if (exactMatch) return exactMatch;
  
  // Then try fuzzy match
  const fuzzyMatch = charts.find(c => namesMatch(c.name, targetName));
  return fuzzyMatch || null;
}

/**
 * Check if birth data matches between two records
 */
export function birthDataMatches(
  data1: { birthDate: string; birthTime?: string; birthLocation?: string },
  data2: { birthDate: string; birthTime?: string; birthLocation?: string }
): boolean {
  // Date must match
  if (data1.birthDate !== data2.birthDate) return false;
  
  // If both have times, they should match
  if (data1.birthTime && data2.birthTime && data1.birthTime !== data2.birthTime) {
    return false;
  }
  
  return true;
}
