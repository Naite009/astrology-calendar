/**
 * Sanskrit and technical terms with their immediate plain translation.
 * Rule for the Vedic tab: no term appears on screen without this being
 * available next to it. A user should never need prior Vedic knowledge.
 */

export const VEDIC_GLOSSARY: Record<string, string> = {
  Lagna: 'Your Vedic rising sign, the starting point of the chart.',
  Rashi: 'The main birth chart, the overall life pattern. Also called D1.',
  Nakshatra: 'One of 27 lunar sections that gives a planet a more specific flavour.',
  Pada: 'One quarter of a nakshatra, an even finer subdivision.',
  Mahadasha: 'A long planetary chapter of life.',
  Antardasha: 'A smaller chapter inside the larger planetary period.',
  Vimshottari: 'The 120-year system of planetary chapters, timed from the Moon at birth.',
  Atmakaraka: 'A major recurring developmental theme in Jaimini astrology. A subject life keeps asking you to study.',
  Amatyakaraka: 'An important indicator of how you contribute or work.',
  Darakaraka: 'One indicator used for close partnership.',
  Navamsa: 'A magnifying chart for partnership, maturation and what develops over time. Also called D9.',
  Dashamsha: 'A magnifying chart for work and public role. Also called D10.',
  Hora: 'A magnifying chart for resources and wealth patterns. Also called D2.',
  Dwadashamsha: 'A magnifying chart for parents, ancestry and inherited family patterns. Also called D12.',
  Saptamsha: 'A magnifying chart for children and lineage. Also called D7.',
  Ayanamsa: 'The gap between the tropical and sidereal zodiacs. This app uses the Lahiri value.',
  'Whole sign houses': 'The rising sign is the entire first house, the next sign the entire second, and so on.',
  Rahu: 'The north lunar node. What attracts and stretches you, and may feel unfamiliar or hard to regulate.',
  Ketu: 'The south lunar node. What already feels familiar or instinctive, and may be easy to fall back on.',
  'Own sign': 'A planet sitting in a sign it rules, so it works on familiar ground. Not the same as exaltation.',
  Exalted: 'A separate dignity condition: the sign where classical texts say a planet functions at its strongest.',
  Debilitated: 'The sign opposite a planet\u2019s exaltation, where the same function tends to work in a less standard way.',
  Vargottama: 'The same sign in both the birth chart and the Navamsa, read as unusually stable.',
  Graha: 'One of the nine bodies used in Jyotish: Sun through Saturn plus Rahu and Ketu.',
};

export function glossaryFor(term: string): string | undefined {
  const key = Object.keys(VEDIC_GLOSSARY).find(k => k.toLowerCase() === term.toLowerCase());
  return key ? VEDIC_GLOSSARY[key] : undefined;
}
