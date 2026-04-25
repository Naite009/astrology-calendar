/**
 * City resolver with fuzzy matching + auto-correction.
 *
 * Used by the relocation reading inputs to validate that a typed city is
 * recognized. If the user types "wynwyd pa" we resolve to "Wynnewood, PA";
 * if they type "washington" but the closest known match is the capital, we
 * resolve to "Washington, DC". A green check is shown when a confident
 * match is found.
 *
 * The match table here is intentionally broader than the latitude lookup in
 * solarReturnVertex.ts — it includes US suburbs, common misspellings, and
 * canonical "City, ST" / "City, Country" labels.
 */

import { formatLocationTitleCase } from "./locationFormat";

export interface ResolvedCity {
  /** The canonical, properly-cased city label (e.g. "Wynnewood, PA"). */
  canonical: string;
  /** Lowercase comparable key. */
  key: string;
  /** True when the user's input did not exactly match the canonical form. */
  corrected: boolean;
  /** 0-1 confidence score from the fuzzy matcher. */
  confidence: number;
}

// ─── City dictionary ───────────────────────────────────────────────
// Format: canonical label → set of search terms (all lowercase, no commas).
// Canonical labels MUST be in title-case with uppercase 2-letter region codes
// (handled by formatLocationTitleCase as a safety net).
const CITY_TABLE: Array<{ canonical: string; aliases: string[] }> = [
  // ── US major cities ──
  { canonical: "New York, NY", aliases: ["new york", "nyc", "new york city", "manhattan"] },
  { canonical: "Brooklyn, NY", aliases: ["brooklyn"] },
  { canonical: "Queens, NY", aliases: ["queens"] },
  { canonical: "Bronx, NY", aliases: ["bronx", "the bronx"] },
  { canonical: "Los Angeles, CA", aliases: ["los angeles", "la", "l a"] },
  { canonical: "San Francisco, CA", aliases: ["san francisco", "sf", "san fran"] },
  { canonical: "San Diego, CA", aliases: ["san diego"] },
  { canonical: "San Jose, CA", aliases: ["san jose"] },
  { canonical: "Oakland, CA", aliases: ["oakland"] },
  { canonical: "Sacramento, CA", aliases: ["sacramento"] },
  { canonical: "Fresno, CA", aliases: ["fresno"] },
  { canonical: "Long Beach, CA", aliases: ["long beach"] },
  { canonical: "Santa Monica, CA", aliases: ["santa monica"] },
  { canonical: "Santa Barbara, CA", aliases: ["santa barbara"] },
  { canonical: "Santa Ana, CA", aliases: ["santa ana"] },
  { canonical: "Anaheim, CA", aliases: ["anaheim"] },
  { canonical: "Berkeley, CA", aliases: ["berkeley"] },
  { canonical: "Palm Springs, CA", aliases: ["palm springs"] },
  { canonical: "Chicago, IL", aliases: ["chicago", "chi town", "chitown"] },
  { canonical: "Houston, TX", aliases: ["houston"] },
  { canonical: "Dallas, TX", aliases: ["dallas"] },
  { canonical: "Austin, TX", aliases: ["austin"] },
  { canonical: "San Antonio, TX", aliases: ["san antonio"] },
  { canonical: "Fort Worth, TX", aliases: ["fort worth", "ft worth"] },
  { canonical: "El Paso, TX", aliases: ["el paso"] },
  { canonical: "Phoenix, AZ", aliases: ["phoenix"] },
  { canonical: "Tucson, AZ", aliases: ["tucson"] },
  { canonical: "Mesa, AZ", aliases: ["mesa"] },
  { canonical: "Scottsdale, AZ", aliases: ["scottsdale"] },
  { canonical: "Sedona, AZ", aliases: ["sedona"] },
  { canonical: "Philadelphia, PA", aliases: ["philadelphia", "philly"] },
  { canonical: "Pittsburgh, PA", aliases: ["pittsburgh"] },
  { canonical: "Wynnewood, PA", aliases: ["wynnewood", "wynwood pa", "wynwyd", "wynwyd pa", "wynwood"] },
  { canonical: "Bryn Mawr, PA", aliases: ["bryn mawr"] },
  { canonical: "Ardmore, PA", aliases: ["ardmore"] },
  { canonical: "Narberth, PA", aliases: ["narberth"] },
  { canonical: "Lancaster, PA", aliases: ["lancaster"] },
  { canonical: "Washington, DC", aliases: ["washington", "washington dc", "dc", "washington d c", "the district"] },
  { canonical: "Seattle, WA", aliases: ["seattle"] },
  { canonical: "Spokane, WA", aliases: ["spokane"] },
  { canonical: "Tacoma, WA", aliases: ["tacoma"] },
  { canonical: "Bellevue, WA", aliases: ["bellevue"] },
  { canonical: "Portland, OR", aliases: ["portland", "portland or", "pdx"] },
  { canonical: "Eugene, OR", aliases: ["eugene"] },
  { canonical: "Bend, OR", aliases: ["bend"] },
  { canonical: "Boston, MA", aliases: ["boston"] },
  { canonical: "Cambridge, MA", aliases: ["cambridge ma", "cambridge mass"] },
  { canonical: "Worcester, MA", aliases: ["worcester"] },
  { canonical: "Salem, MA", aliases: ["salem ma", "salem mass"] },
  { canonical: "Provincetown, MA", aliases: ["provincetown", "ptown"] },
  { canonical: "Denver, CO", aliases: ["denver"] },
  { canonical: "Boulder, CO", aliases: ["boulder"] },
  { canonical: "Colorado Springs, CO", aliases: ["colorado springs"] },
  { canonical: "Aspen, CO", aliases: ["aspen"] },
  { canonical: "Atlanta, GA", aliases: ["atlanta", "atl"] },
  { canonical: "Savannah, GA", aliases: ["savannah"] },
  { canonical: "Miami, FL", aliases: ["miami"] },
  { canonical: "Orlando, FL", aliases: ["orlando"] },
  { canonical: "Tampa, FL", aliases: ["tampa"] },
  { canonical: "Jacksonville, FL", aliases: ["jacksonville"] },
  { canonical: "Fort Lauderdale, FL", aliases: ["fort lauderdale", "ft lauderdale"] },
  { canonical: "Key West, FL", aliases: ["key west"] },
  { canonical: "St. Petersburg, FL", aliases: ["st petersburg fl", "saint petersburg fl"] },
  { canonical: "Las Vegas, NV", aliases: ["las vegas", "vegas"] },
  { canonical: "Reno, NV", aliases: ["reno"] },
  { canonical: "Detroit, MI", aliases: ["detroit"] },
  { canonical: "Ann Arbor, MI", aliases: ["ann arbor"] },
  { canonical: "Grand Rapids, MI", aliases: ["grand rapids"] },
  { canonical: "Minneapolis, MN", aliases: ["minneapolis"] },
  { canonical: "St. Paul, MN", aliases: ["st paul mn", "saint paul mn"] },
  { canonical: "Milwaukee, WI", aliases: ["milwaukee"] },
  { canonical: "Madison, WI", aliases: ["madison wi"] },
  { canonical: "Indianapolis, IN", aliases: ["indianapolis", "indy"] },
  { canonical: "Columbus, OH", aliases: ["columbus oh"] },
  { canonical: "Cleveland, OH", aliases: ["cleveland"] },
  { canonical: "Cincinnati, OH", aliases: ["cincinnati"] },
  { canonical: "Charlotte, NC", aliases: ["charlotte"] },
  { canonical: "Raleigh, NC", aliases: ["raleigh"] },
  { canonical: "Asheville, NC", aliases: ["asheville"] },
  { canonical: "Durham, NC", aliases: ["durham"] },
  { canonical: "Charleston, SC", aliases: ["charleston sc"] },
  { canonical: "Charleston, WV", aliases: ["charleston wv"] },
  { canonical: "Nashville, TN", aliases: ["nashville"] },
  { canonical: "Memphis, TN", aliases: ["memphis"] },
  { canonical: "Knoxville, TN", aliases: ["knoxville"] },
  { canonical: "New Orleans, LA", aliases: ["new orleans", "nola"] },
  { canonical: "Baton Rouge, LA", aliases: ["baton rouge"] },
  { canonical: "Baltimore, MD", aliases: ["baltimore"] },
  { canonical: "Annapolis, MD", aliases: ["annapolis"] },
  { canonical: "Potomac, MD", aliases: ["potomac", "potomac md", "potomac maryland"] },
  { canonical: "Bethesda, MD", aliases: ["bethesda"] },
  { canonical: "Chevy Chase, MD", aliases: ["chevy chase"] },
  { canonical: "Silver Spring, MD", aliases: ["silver spring"] },
  { canonical: "Rockville, MD", aliases: ["rockville"] },
  { canonical: "Gaithersburg, MD", aliases: ["gaithersburg"] },
  { canonical: "Frederick, MD", aliases: ["frederick md"] },
  { canonical: "Columbia, MD", aliases: ["columbia md"] },
  { canonical: "Towson, MD", aliases: ["towson"] },
  { canonical: "College Park, MD", aliases: ["college park"] },
  { canonical: "Takoma Park, MD", aliases: ["takoma park"] },
  { canonical: "Hagerstown, MD", aliases: ["hagerstown"] },
  { canonical: "Ocean City, MD", aliases: ["ocean city md"] },
  { canonical: "Newark, NJ", aliases: ["newark"] },
  { canonical: "Jersey City, NJ", aliases: ["jersey city"] },
  { canonical: "Princeton, NJ", aliases: ["princeton"] },
  { canonical: "Hoboken, NJ", aliases: ["hoboken"] },
  { canonical: "Providence, RI", aliases: ["providence"] },
  { canonical: "Hartford, CT", aliases: ["hartford"] },
  { canonical: "New Haven, CT", aliases: ["new haven"] },
  { canonical: "Burlington, VT", aliases: ["burlington vt"] },
  { canonical: "Portland, ME", aliases: ["portland me", "portland maine"] },
  { canonical: "Manchester, NH", aliases: ["manchester nh"] },
  { canonical: "Albany, NY", aliases: ["albany"] },
  { canonical: "Buffalo, NY", aliases: ["buffalo"] },
  { canonical: "Rochester, NY", aliases: ["rochester ny"] },
  { canonical: "Syracuse, NY", aliases: ["syracuse"] },
  { canonical: "Ithaca, NY", aliases: ["ithaca"] },
  { canonical: "Honolulu, HI", aliases: ["honolulu", "oahu"] },
  { canonical: "Anchorage, AK", aliases: ["anchorage"] },
  { canonical: "Salt Lake City, UT", aliases: ["salt lake city", "slc"] },
  { canonical: "Park City, UT", aliases: ["park city"] },
  { canonical: "Boise, ID", aliases: ["boise"] },
  { canonical: "Helena, MT", aliases: ["helena"] },
  { canonical: "Bozeman, MT", aliases: ["bozeman"] },
  { canonical: "Missoula, MT", aliases: ["missoula"] },
  { canonical: "Cheyenne, WY", aliases: ["cheyenne"] },
  { canonical: "Jackson, WY", aliases: ["jackson wy", "jackson hole"] },
  { canonical: "Omaha, NE", aliases: ["omaha"] },
  { canonical: "Des Moines, IA", aliases: ["des moines"] },
  { canonical: "Kansas City, MO", aliases: ["kansas city"] },
  { canonical: "St. Louis, MO", aliases: ["st louis", "saint louis"] },
  { canonical: "Oklahoma City, OK", aliases: ["oklahoma city", "okc"] },
  { canonical: "Tulsa, OK", aliases: ["tulsa"] },
  { canonical: "Little Rock, AR", aliases: ["little rock"] },
  { canonical: "Albuquerque, NM", aliases: ["albuquerque", "abq"] },
  { canonical: "Santa Fe, NM", aliases: ["santa fe"] },
  { canonical: "Taos, NM", aliases: ["taos"] },
  { canonical: "Birmingham, AL", aliases: ["birmingham al"] },
  { canonical: "Louisville, KY", aliases: ["louisville"] },
  { canonical: "Lexington, KY", aliases: ["lexington ky"] },
  { canonical: "Richmond, VA", aliases: ["richmond va"] },
  { canonical: "Norfolk, VA", aliases: ["norfolk"] },
  { canonical: "Virginia Beach, VA", aliases: ["virginia beach"] },
  { canonical: "Arlington, VA", aliases: ["arlington va"] },
  { canonical: "Alexandria, VA", aliases: ["alexandria va"] },

  // ── International ──
  { canonical: "London, UK", aliases: ["london", "london uk", "london england"] },
  { canonical: "Paris, France", aliases: ["paris"] },
  { canonical: "Berlin, Germany", aliases: ["berlin"] },
  { canonical: "Munich, Germany", aliases: ["munich", "munchen"] },
  { canonical: "Hamburg, Germany", aliases: ["hamburg"] },
  { canonical: "Frankfurt, Germany", aliases: ["frankfurt"] },
  { canonical: "Rome, Italy", aliases: ["rome", "roma"] },
  { canonical: "Milan, Italy", aliases: ["milan", "milano"] },
  { canonical: "Florence, Italy", aliases: ["florence", "firenze"] },
  { canonical: "Venice, Italy", aliases: ["venice", "venezia"] },
  { canonical: "Naples, Italy", aliases: ["naples italy", "napoli"] },
  { canonical: "Madrid, Spain", aliases: ["madrid"] },
  { canonical: "Barcelona, Spain", aliases: ["barcelona"] },
  { canonical: "Seville, Spain", aliases: ["seville", "sevilla"] },
  { canonical: "Valencia, Spain", aliases: ["valencia"] },
  { canonical: "Lisbon, Portugal", aliases: ["lisbon", "lisboa"] },
  { canonical: "Porto, Portugal", aliases: ["porto", "oporto"] },
  { canonical: "Amsterdam, Netherlands", aliases: ["amsterdam"] },
  { canonical: "Rotterdam, Netherlands", aliases: ["rotterdam"] },
  { canonical: "The Hague, Netherlands", aliases: ["the hague", "den haag"] },
  { canonical: "Brussels, Belgium", aliases: ["brussels", "bruxelles"] },
  { canonical: "Vienna, Austria", aliases: ["vienna", "wien"] },
  { canonical: "Zurich, Switzerland", aliases: ["zurich"] },
  { canonical: "Geneva, Switzerland", aliases: ["geneva"] },
  { canonical: "Bern, Switzerland", aliases: ["bern", "berne"] },
  { canonical: "Stockholm, Sweden", aliases: ["stockholm"] },
  { canonical: "Gothenburg, Sweden", aliases: ["gothenburg", "goteborg"] },
  { canonical: "Oslo, Norway", aliases: ["oslo"] },
  { canonical: "Copenhagen, Denmark", aliases: ["copenhagen", "kobenhavn"] },
  { canonical: "Helsinki, Finland", aliases: ["helsinki"] },
  { canonical: "Reykjavik, Iceland", aliases: ["reykjavik"] },
  { canonical: "Dublin, Ireland", aliases: ["dublin"] },
  { canonical: "Edinburgh, UK", aliases: ["edinburgh"] },
  { canonical: "Glasgow, UK", aliases: ["glasgow"] },
  { canonical: "Manchester, UK", aliases: ["manchester uk", "manchester england"] },
  { canonical: "Liverpool, UK", aliases: ["liverpool"] },
  { canonical: "Birmingham, UK", aliases: ["birmingham uk", "birmingham england"] },
  { canonical: "Prague, Czech Republic", aliases: ["prague", "praha"] },
  { canonical: "Warsaw, Poland", aliases: ["warsaw", "warszawa"] },
  { canonical: "Krakow, Poland", aliases: ["krakow", "cracow"] },
  { canonical: "Budapest, Hungary", aliases: ["budapest"] },
  { canonical: "Athens, Greece", aliases: ["athens"] },
  { canonical: "Moscow, Russia", aliases: ["moscow"] },
  { canonical: "St. Petersburg, Russia", aliases: ["st petersburg", "saint petersburg"] },
  { canonical: "Istanbul, Turkey", aliases: ["istanbul"] },
  { canonical: "Cairo, Egypt", aliases: ["cairo"] },
  { canonical: "Tel Aviv, Israel", aliases: ["tel aviv"] },
  { canonical: "Jerusalem, Israel", aliases: ["jerusalem"] },
  { canonical: "Dubai, UAE", aliases: ["dubai"] },
  { canonical: "Abu Dhabi, UAE", aliases: ["abu dhabi"] },
  { canonical: "Doha, Qatar", aliases: ["doha"] },
  { canonical: "Mumbai, India", aliases: ["mumbai", "bombay"] },
  { canonical: "New Delhi, India", aliases: ["delhi", "new delhi"] },
  { canonical: "Bangalore, India", aliases: ["bangalore", "bengaluru"] },
  { canonical: "Kolkata, India", aliases: ["kolkata", "calcutta"] },
  { canonical: "Chennai, India", aliases: ["chennai", "madras"] },
  { canonical: "Tokyo, Japan", aliases: ["tokyo"] },
  { canonical: "Osaka, Japan", aliases: ["osaka"] },
  { canonical: "Kyoto, Japan", aliases: ["kyoto"] },
  { canonical: "Beijing, China", aliases: ["beijing", "peking"] },
  { canonical: "Shanghai, China", aliases: ["shanghai"] },
  { canonical: "Hong Kong", aliases: ["hong kong", "hk"] },
  { canonical: "Singapore", aliases: ["singapore"] },
  { canonical: "Bangkok, Thailand", aliases: ["bangkok"] },
  { canonical: "Chiang Mai, Thailand", aliases: ["chiang mai"] },
  { canonical: "Seoul, South Korea", aliases: ["seoul"] },
  { canonical: "Taipei, Taiwan", aliases: ["taipei"] },
  { canonical: "Manila, Philippines", aliases: ["manila"] },
  { canonical: "Jakarta, Indonesia", aliases: ["jakarta"] },
  { canonical: "Bali, Indonesia", aliases: ["bali", "ubud", "denpasar"] },
  { canonical: "Kuala Lumpur, Malaysia", aliases: ["kuala lumpur", "kl"] },
  { canonical: "Ho Chi Minh City, Vietnam", aliases: ["ho chi minh city", "saigon"] },
  { canonical: "Hanoi, Vietnam", aliases: ["hanoi"] },
  { canonical: "Sydney, Australia", aliases: ["sydney"] },
  { canonical: "Melbourne, Australia", aliases: ["melbourne"] },
  { canonical: "Brisbane, Australia", aliases: ["brisbane"] },
  { canonical: "Perth, Australia", aliases: ["perth"] },
  { canonical: "Adelaide, Australia", aliases: ["adelaide"] },
  { canonical: "Auckland, New Zealand", aliases: ["auckland"] },
  { canonical: "Wellington, New Zealand", aliases: ["wellington"] },
  { canonical: "Toronto, Canada", aliases: ["toronto"] },
  { canonical: "Vancouver, Canada", aliases: ["vancouver"] },
  { canonical: "Montreal, Canada", aliases: ["montreal"] },
  { canonical: "Calgary, Canada", aliases: ["calgary"] },
  { canonical: "Ottawa, Canada", aliases: ["ottawa"] },
  { canonical: "Quebec City, Canada", aliases: ["quebec city", "quebec"] },
  { canonical: "Mexico City, Mexico", aliases: ["mexico city", "cdmx", "df"] },
  { canonical: "Guadalajara, Mexico", aliases: ["guadalajara"] },
  { canonical: "Oaxaca, Mexico", aliases: ["oaxaca"] },
  { canonical: "San Miguel de Allende, Mexico", aliases: ["san miguel de allende", "san miguel"] },
  { canonical: "Tulum, Mexico", aliases: ["tulum"] },
  { canonical: "Playa del Carmen, Mexico", aliases: ["playa del carmen"] },
  { canonical: "Cancun, Mexico", aliases: ["cancun"] },
  { canonical: "Puerto Vallarta, Mexico", aliases: ["puerto vallarta"] },
  { canonical: "São Paulo, Brazil", aliases: ["sao paulo", "saopaulo"] },
  { canonical: "Rio de Janeiro, Brazil", aliases: ["rio de janeiro", "rio"] },
  { canonical: "Buenos Aires, Argentina", aliases: ["buenos aires"] },
  { canonical: "Lima, Peru", aliases: ["lima"] },
  { canonical: "Cusco, Peru", aliases: ["cusco", "cuzco"] },
  { canonical: "Bogota, Colombia", aliases: ["bogota"] },
  { canonical: "Medellin, Colombia", aliases: ["medellin"] },
  { canonical: "Cartagena, Colombia", aliases: ["cartagena"] },
  { canonical: "Santiago, Chile", aliases: ["santiago"] },
  { canonical: "Caracas, Venezuela", aliases: ["caracas"] },
  { canonical: "Quito, Ecuador", aliases: ["quito"] },
  { canonical: "Montevideo, Uruguay", aliases: ["montevideo"] },
  { canonical: "Havana, Cuba", aliases: ["havana", "habana"] },
  { canonical: "San Juan, Puerto Rico", aliases: ["san juan"] },
  { canonical: "Johannesburg, South Africa", aliases: ["johannesburg", "joburg"] },
  { canonical: "Cape Town, South Africa", aliases: ["cape town", "capetown"] },
  { canonical: "Nairobi, Kenya", aliases: ["nairobi"] },
  { canonical: "Lagos, Nigeria", aliases: ["lagos"] },
  { canonical: "Accra, Ghana", aliases: ["accra"] },
  { canonical: "Marrakech, Morocco", aliases: ["marrakech", "marrakesh"] },
  { canonical: "Casablanca, Morocco", aliases: ["casablanca"] },
];

// Build normalized lookup index. Each entry maps a search term → canonical.
const ALIAS_INDEX = (() => {
  const index = new Map<string, string>();
  for (const { canonical, aliases } of CITY_TABLE) {
    // Always index the canonical form itself (lowercased, no comma).
    index.set(canonical.toLowerCase(), canonical);
    index.set(canonical.toLowerCase().replace(/,/g, ""), canonical);
    for (const alias of aliases) {
      index.set(alias.toLowerCase(), canonical);
    }
  }
  return index;
})();

// Pre-tokenized list for fuzzy matching.
const ALIAS_KEYS = Array.from(ALIAS_INDEX.keys());

const normalizeQuery = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Levenshtein distance — small helper, fast enough for our ~250 entries.
 */
const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
};

/**
 * Compute similarity 0-1 between two strings using normalized Levenshtein.
 */
const similarity = (a: string, b: string): number => {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
};

/**
 * Resolve a typed city string to its canonical form.
 *
 * Returns null when no confident match is found (similarity < 0.62 and no
 * substring/prefix overlap), so the caller can show a neutral state.
 */
export const resolveCity = (raw: string | null | undefined): ResolvedCity | null => {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;

  const query = normalizeQuery(trimmed);
  if (!query) return null;

  // 1) Exact alias hit — fastest path, no correction needed.
  const exact = ALIAS_INDEX.get(query);
  if (exact) {
    return {
      canonical: exact,
      key: query,
      corrected: formatLocationTitleCase(trimmed) !== exact,
      confidence: 1,
    };
  }

  // 2) Fuzzy match. Score every alias and pick the best.
  let bestKey = "";
  let bestScore = 0;
  for (const key of ALIAS_KEYS) {
    let score = similarity(query, key);
    // Bonus for substring containment (e.g. "wynwyd pa" → "wynwyd pa" alias).
    if (key.includes(query) || query.includes(key)) {
      score = Math.max(score, 0.85);
    }
    // Bonus when first word matches (city name shared, suffix differs).
    const queryFirst = query.split(" ")[0];
    const keyFirst = key.split(" ")[0];
    if (queryFirst.length >= 4 && queryFirst === keyFirst) {
      score = Math.max(score, 0.78);
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  if (bestScore >= 0.62 && bestKey) {
    const canonical = ALIAS_INDEX.get(bestKey)!;
    return {
      canonical,
      key: bestKey,
      corrected: true,
      confidence: bestScore,
    };
  }

  return null;
};
