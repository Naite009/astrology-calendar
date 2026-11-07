import { getEssentialDignity } from '@/lib/essentialDignity';

/** Legacy references cannot establish medical history, biography or supernatural ability. */
export function unsupportedLegacyClaim(text: string): boolean {
  return /psychic|clairvoy|clairaud|clairsent|telepath|mediumship|prophe(?:tic|cy)|astral|channel(?:ing|ling)|channel.{0,30}(?:dead|spirit)|past[- ]li(?:fe|ves)|inherited.{0,40}(?:trauma|grief)|ancestral.{0,40}(?:trauma|suffering)|karm(?:a|ic)|soul.?s? (?:destiny|purpose)|(?:mother|father|parent|childhood|inner child).{0,70}(?:absent|unloved|unseen|wound|trauma|neglect|abandon|controll|power dynamics)|depression|delusion|health crisis|guaranteed|lottery|genius[- ]level|there is no going back|cannot emotionally thrive/i.test(text);
}

export function checkedLegacyText(text: string): string {
  const sentences = text.replace(/—/g, ', ').split(/(?<=[.!?])\s+|\n/);
  return sentences.filter(sentence => {
    if (unsupportedLegacyClaim(sentence)) return false;
    const claims = [...sentence.matchAll(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\s+in\s+(?:(domicile|detriment|exaltation|fall)\s+in\s+)?(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)(?:\s+(?:is\s+)?(?:in\s+)?(domicile|detriment|exaltation|fall|exalted))?/gi)];
    return claims.every(match => {
      const claim = match[2] ?? match[4];
      if (!claim) return true;
      const expected = claim.toLowerCase() === 'exalted' ? 'exaltation' : claim.toLowerCase();
      return getEssentialDignity(match[1], match[3]).toLowerCase() === expected;
    });
  }).join(' ').trim();
}

/** Copies legacy display objects, never modifies the libraries or saved chart facts. */
export function checkedLegacyDisplay<T>(value: T): T {
  if (typeof value === 'string') return checkedLegacyText(value) as T;
  if (Array.isArray(value)) return value.map(item => checkedLegacyDisplay(item)).filter(item => item !== '') as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /^(id|factors|tags|thematicTags|planets|aspectTypes|aspectType|signs|sign|category|polarity|symbol|strength)$/.test(key) ? item : checkedLegacyDisplay(item)])) as T;
  return value;
}