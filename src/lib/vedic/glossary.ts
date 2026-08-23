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
  Drishti: 'A graha\u2019s glance. Jyotish counts glances by whole sign rather than by exact degree.',
  Shadbala: 'The classical six-fold strength calculation. This app shows a simpler condition index instead and says so.',
  Avastha: 'The maturity state of a graha, judged by its degree inside the sign.',
  Gochara: 'Transits, read by sign and counted from the natal Moon as well as the rising sign.',
  'Sade Sati': 'The roughly seven-year stretch when Saturn crosses the sign before, the same sign as, and the sign after the natal Moon. A pressure period, not a prediction of disaster.',
  Ashtakavarga: 'A classical point system. Each planet awards benefic points to the twelve signs from eight reference points, and the totals show which signs and houses have real support.',
  Bhinnashtakavarga: 'One planet\u2019s own point score across the twelve signs.',
  Sarvashtakavarga: 'The combined point score per sign, adding all seven planets together. About 28 is average.',
  Panchanga: 'The five-part description of a day: lunar day, weekday, lunar mansion, nitya yoga and karana.',
  Tithi: 'The lunar day, one of thirty divisions of the cycle from new Moon to new Moon.',
  Paksha: 'The half of the lunar month. Shukla is waxing and Krishna is waning.',
  Karana: 'Half of a lunar day, traditionally used to choose the right kind of activity.',
  Vara: 'The weekday and the graha that rules it.',
  Arudha: 'The image of a house: how that part of life appears to other people rather than what it actually is.',
  'Arudha Lagna': 'The image of the whole chart, meaning your public reputation as distinct from your private reality.',
  Upapada: 'The image of the partnership, used descriptively for how a marriage appears from outside.',
  Gana: 'The temperament class of a nakshatra: Deva, Manushya or Rakshasa.',
  Yoni: 'The animal nature of a nakshatra, read as instinct under pressure.',
  'Tara Bala': 'The nine-fold count from the birth nakshatra, used in classical timing.',
  Parivartana: 'Two house lords sitting in each other\u2019s signs, an exchange that ties those two areas of life together.',
  Yoga: 'A named combination of placements. Classical texts describe hundreds and most charts carry several.',
  Kendra: 'A corner house: the 1st, 4th, 7th or 10th. Classically the houses of action.',
  Trikona: 'A trine house: the 1st, 5th or 9th. Classically the houses of support and merit.',
  Dusthana: 'The 6th, 8th and 12th houses, where classical texts locate strain rather than reward.',
  Moolatrikona: 'A favoured stretch of a graha\u2019s own sign, stronger than ordinary own-sign placement.',
  Shodashavarga: 'The full set of sixteen divisional charts.',
  Asta: 'Combustion. A graha too close to the Sun to act freely on its own initiative.',
  'Graha yuddha': 'A planetary war: two visible planets within one degree, where classical texts say one carries the position.',
};

export function glossaryFor(term: string): string | undefined {
  const key = Object.keys(VEDIC_GLOSSARY).find(k => k.toLowerCase() === term.toLowerCase());
  return key ? VEDIC_GLOSSARY[key] : undefined;
}
