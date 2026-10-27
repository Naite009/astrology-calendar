// Solar Return Hemispheric Emphasis: factual counts and houses

// ============================================================================
// TYPES
// ============================================================================

export interface HemisphereDetail {
  title: string;
  summary: string;
  bodyParagraphs: string[];
  focusAreas: string[];
  challenges: string[];
  practicalAdvice: string[];
}

export interface SRHemisphericResult {
  upper: number;
  lower: number;
  east: number;
  west: number;
  upperPlanets: string[];
  lowerPlanets: string[];
  eastPlanets: string[];
  westPlanets: string[];
  totalCounted: number;
  verticalLabel: string;   // e.g. "Balanced Upper/Lower" or "Upper Dominant"
  horizontalLabel: string; // e.g. "Extreme Eastern"
  verticalDetail: HemisphereDetail;
  horizontalDetail: HemisphereDetail;
  combinedInsight: string;
}

// ============================================================================
// Hemisphere emphasis is a COUNT. It is published as factual labels plus the
// houses involved; no event lists (marriage, divorce, babies, hospital stays),
// no "others set the agenda" claims, and no CEO-year style archetypes.
// Upper = Houses 7-12, Lower = Houses 1-6, East = Houses 10-3, West = Houses 4-9.
// ============================================================================

const HOUSE_AREA = ['', 'self-presentation', 'income and spending', 'conversations and learning', 'home and private life', 'enjoyment and creative work', 'workload and routines', 'close relationships and agreements', 'shared money and responsibilities', 'study and travel plans', 'work and public responsibilities', 'friendships and group plans', 'private time and unfinished work'];
const areas = (houses: number[]) => houses.map(h => `House ${h}: ${HOUSE_AREA[h]}`);

function factualDetail(title: string, summary: string, houses: number[]): HemisphereDetail {
  return { title, summary, bodyParagraphs: [], focusAreas: areas(houses), challenges: [], practicalAdvice: [] };
}

function getVerticalDetail(upper: number, lower: number, total: number): { label: string; detail: HemisphereDetail } {
  const diff = Math.abs(upper - lower);
  const count = `${upper} of ${total} counted planets are above the horizon (Houses 7 to 12) and ${lower} are below (Houses 1 to 6).`;
  if (diff <= 1) return { label: 'Balanced Upper/Lower', detail: factualDetail('Balanced above and below the horizon', `${count} Neither half stands out, so individual house placements carry more weight than this count.`, []) };
  const strong = diff >= 6;
  if (upper > lower) return { label: strong ? 'Strong Upper Dominance' : 'Upper-Leaning', detail: factualDetail('More planets above the horizon', `${count} The houses above the horizon are listed below.`, [7, 8, 9, 10, 11, 12]) };
  return { label: strong ? 'Strong Lower Dominance' : 'Lower-Leaning', detail: factualDetail('More planets below the horizon', `${count} The houses below the horizon are listed below.`, [1, 2, 3, 4, 5, 6]) };
}

function getHorizontalDetail(east: number, west: number, total: number): { label: string; detail: HemisphereDetail } {
  const eastPct = total > 0 ? (east / total) * 100 : 50;
  const diff = Math.abs(east - west);
  const count = `${east} of ${total} counted planets are on the eastern side (Houses 10 to 3) and ${west} are on the western side (Houses 4 to 9).`;
  if (diff <= 1) return { label: 'Balanced East/West', detail: factualDetail('Balanced east and west', `${count} Neither side stands out, so individual house placements carry more weight than this count.`, []) };
  const strong = diff >= 6;
  if (east > west) return { label: eastPct >= 85 ? 'Extreme Eastern Dominance' : strong ? 'Strong Eastern Emphasis' : 'Eastern-Leaning', detail: factualDetail('More planets on the eastern side', `${count} The eastern houses are listed below.`, [10, 11, 12, 1, 2, 3]) };
  return { label: (100 - eastPct) >= 85 ? 'Extreme Western Dominance' : strong ? 'Strong Western Emphasis' : 'Western-Leaning', detail: factualDetail('More planets on the western side', `${count} The western houses are listed below.`, [4, 5, 6, 7, 8, 9]) };
}

function getCombinedInsight(upper: number, lower: number, east: number, west: number, total: number): string {
  if (!total) return '';
  return `Counts: ${upper} above, ${lower} below, ${east} east, ${west} west of ${total} planets. Hemisphere counts show where planets cluster; the houses each planet occupies give the specific life areas.`;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function analyzeSRHemispheres(
  planetHouses: Record<string, number | null>,
  planetNames: string[]
): SRHemisphericResult {
  let upper = 0, lower = 0, east = 0, west = 0;
  const upperPlanets: string[] = [], lowerPlanets: string[] = [];
  const eastPlanets: string[] = [], westPlanets: string[] = [];

  for (const name of planetNames) {
    const h = planetHouses[name];
    if (h == null) continue;
    if (h >= 7 && h <= 12) { upper++; upperPlanets.push(name); } else { lower++; lowerPlanets.push(name); }
    if (h >= 10 || h <= 3) { east++; eastPlanets.push(name); } else { west++; westPlanets.push(name); }
  }

  const total = upper + lower;
  const { label: verticalLabel, detail: verticalDetail } = getVerticalDetail(upper, lower, total);
  const { label: horizontalLabel, detail: horizontalDetail } = getHorizontalDetail(east, west, total);
  const combinedInsight = getCombinedInsight(upper, lower, east, west, total);

  return {
    upper, lower, east, west,
    upperPlanets, lowerPlanets, eastPlanets, westPlanets,
    totalCounted: total,
    verticalLabel,
    horizontalLabel,
    verticalDetail,
    horizontalDetail,
    combinedInsight
  };
}
