// Shared scoring engine for Year Priority — used by both the UI card and PDF export
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeLunarPhaseTimeline } from '@/lib/solarReturnLunarTimeline';

export interface Driver { source: string; weight: number; }

export interface ScoredCategory {
  id: string;
  label: string;
  score: number;
  confidence: string;
  drivers: Driver[];
  /** Plain-English summary of why this theme ranks */
  summary: string;
}

const CATEGORIES = [
  { id: 'identity_direction', label: 'Identity and Direction', house: 1 },
  { id: 'relationships', label: 'Relationships', house: 7 },
  { id: 'career_public_life', label: 'Career and Public Life', house: 10 },
  { id: 'home_family_private_life', label: 'Home and Private Life', house: 4 },
  { id: 'money_resources', label: 'Money and Resources', house: 2 },
  { id: 'health_work_routines', label: 'Health, Work, and Routines', house: 6 },
  { id: 'creativity_children_joy', label: 'Creativity, Children, and Joy', house: 5 },
  { id: 'inner_healing_spirituality', label: 'Inner Healing and Spirituality', house: 12 },
  { id: 'transformation_shared_resources', label: 'Transformation and Shared Resources', house: 8 },
  { id: 'learning_travel_beliefs', label: 'Learning, Travel, and Beliefs', house: 9 },
  { id: 'friends_community_future', label: 'Friends, Community, and Future Vision', house: 11 },
];

const HOUSE_TO_CATEGORY: Record<number, string> = {
  1: 'identity_direction', 2: 'money_resources', 3: 'learning_travel_beliefs',
  4: 'home_family_private_life', 5: 'creativity_children_joy', 6: 'health_work_routines',
  7: 'relationships', 8: 'transformation_shared_resources', 9: 'learning_travel_beliefs',
  10: 'career_public_life', 11: 'friends_community_future', 12: 'inner_healing_spirituality',
};

const ANGLE_TO_CATEGORIES: Record<string, string[]> = {
  Ascendant: ['identity_direction'], Descendant: ['relationships'],
  Midheaven: ['career_public_life'], IC: ['home_family_private_life'],
};

const PHASE_BOOSTS: Record<string, string[]> = {
  'New Moon': ['identity_direction'],
  'Crescent': ['identity_direction'],
  'First Quarter': ['identity_direction', 'relationships'],
  'Gibbous': ['health_work_routines'],
  'Full Moon': ['relationships'],
  'Disseminating': ['learning_travel_beliefs', 'friends_community_future'],
  'Last Quarter': ['inner_healing_spirituality'],
  'Balsamic': ['inner_healing_spirituality', 'home_family_private_life'],
};

const ASPECT_WEIGHTS: Record<string, number> = {
  conjunct: 10, conjunction: 10, Conjunction: 10,
  opposite: 6, opposition: 6, Opposition: 6,
  square: 5, Square: 5, trine: 3, Trine: 3, sextile: 2, Sextile: 2,
};

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const ASPECT_DEFS = [
  { name: 'conjunct', angle: 0 }, { name: 'opposite', angle: 180 },
  { name: 'square', angle: 90 }, { name: 'trine', angle: 120 }, { name: 'sextile', angle: 60 },
];
const ORB = 3;

function ordSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  const last = n % 10;
  if (last === 1) return 'st'; if (last === 2) return 'nd'; if (last === 3) return 'rd'; return 'th';
}

/** Build a plain-English summary for a category based on its drivers */
function buildSummary(catId: string, label: string, drivers: Driver[]): string {
  if (drivers.length === 0) return '';
  
  // Group driver reasons
  const houseDrivers = drivers.filter(d => d.source.includes('house'));
  const angleDrivers = drivers.filter(d => d.source.includes('angle') || d.source.includes('Ascendant') || d.source.includes('Midheaven') || d.source.includes('Descendant') || d.source.includes('IC'));
  const phaseDrivers = drivers.filter(d => d.source.includes('phase'));
  
  const parts: string[] = [];
  
  if (houseDrivers.length > 0) {
    const hNames = houseDrivers.map(d => d.source).join('; ');
    parts.push(`Multiple planets activate this area through house placements (${hNames})`);
  }
  if (angleDrivers.length > 0) {
    parts.push(`Direct angle contacts amplify visibility`);
  }
  if (phaseDrivers.length > 0) {
    parts.push(`The lunar phase reinforces this direction`);
  }
  
  if (parts.length === 0) {
    return `${label} is active this year based on ${drivers.length} chart signals.`;
  }
  
  return parts.join('. ') + '.';
}

export function computeYearPriorities(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): ScoredCategory[] {
  const scores: Record<string, { score: number; drivers: Driver[] }> = {};
  CATEGORIES.forEach(c => { scores[c.id] = { score: 0, drivers: [] }; });

  const add = (catId: string, weight: number, source: string) => {
    if (!scores[catId]) return;
    scores[catId].score += weight;
    scores[catId].drivers.push({ source, weight });
  };

  // ──── PRIMARY SIGNAL: House placements ────────────────────────
  // Sun house (strongest signal — where your vitality goes this year)
  const sunH = analysis.sunHouse?.house;
  if (sunH) {
    const cat = HOUSE_TO_CATEGORY[sunH];
    if (cat) add(cat, 12, `Sun in ${sunH}${ordSuffix(sunH)} house — your core energy focuses here`);
  }

  // Moon house (second strongest — where your heart invests)
  const moonH = analysis.moonHouse?.house;
  if (moonH) {
    const cat = HOUSE_TO_CATEGORY[moonH];
    if (cat) add(cat, 10, `Moon in ${moonH}${ordSuffix(moonH)} house — your emotional investment lives here`);
  }

  // House emphasis (2+ planets in a house)
  const srHouseCounts: Record<number, string[]> = {};
  for (const ov of analysis.houseOverlays || []) {
    if (ov.srHouse) { if (!srHouseCounts[ov.srHouse]) srHouseCounts[ov.srHouse] = []; srHouseCounts[ov.srHouse].push(ov.planet); }
  }
  for (const [h, planets] of Object.entries(srHouseCounts)) {
    const hNum = Number(h);
    const cat = HOUSE_TO_CATEGORY[hNum];
    if (cat && planets.length >= 2) {
      const planetNames = planets.join(', ');
      add(cat, 9, `${planets.length} planets (${planetNames}) in ${hNum}${ordSuffix(hNum)} house`);
      if ([1, 4, 7, 10].includes(hNum)) add(cat, 3, `Angular house ${hNum} — extra emphasis`);
    }
  }

  // ──── Natal house overlays (SR planets landing in natal houses) ────
  for (const ov of analysis.houseOverlays || []) {
    const overlayH = (ov as any).srInNatalHouse ?? ov.natalHouse;
    if (overlayH) {
      const cat = HOUSE_TO_CATEGORY[overlayH];
      if (cat) add(cat, 8, `SR ${ov.planet} falls in your natal ${overlayH}${ordSuffix(overlayH)} house`);
    }
  }

  // ──── SECONDARY SIGNAL: Angle activations ────────────────────
  const srAngles: { name: string; deg: number | null }[] = [];
  const srAsc = srChart.houseCusps?.house1; const srMC = srChart.houseCusps?.house10;
  if (srAsc) { const d = toAbsDeg(srAsc); srAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) srAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (srMC) { const d = toAbsDeg(srMC); srAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) srAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  const natalAngles: { name: string; deg: number | null }[] = [];
  const nAsc = natalChart.houseCusps?.house1; const nMC = natalChart.houseCusps?.house10;
  if (nAsc) { const d = toAbsDeg(nAsc); natalAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) natalAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
  if (nMC) { const d = toAbsDeg(nMC); natalAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) natalAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

  const allPlanetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];

  // SR angles → natal planets (house-based category only)
  for (const angle of srAngles) {
    if (angle.deg === null) continue;
    const angleCats = ANGLE_TO_CATEGORIES[angle.name] || [];
    for (const pName of allPlanetNames) {
      const pos = natalChart.planets[pName as keyof typeof natalChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos); if (pDeg === null) continue;
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(angle.deg - pDeg); if (diff > 180) diff = 360 - diff;
        if (Math.abs(diff - asp.angle) <= ORB) {
          const w = Math.min(ASPECT_WEIGHTS[asp.name] || 2, 8);
          const dp = pName === 'NorthNode' ? 'North Node' : pName;
          angleCats.forEach(c => add(c, w, `SR ${angle.name} ${asp.name}s your natal ${dp}`));
        }
      }
    }
  }

  // SR planets → natal angles (house-based category only)
  for (const pName of allPlanetNames) {
    const srPos = srChart.planets[pName as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos); if (srDeg === null) continue;
    for (const angle of natalAngles) {
      if (angle.deg === null) continue;
      const angleCats = ANGLE_TO_CATEGORIES[angle.name] || [];
      for (const asp of ASPECT_DEFS) {
        let diff = Math.abs(srDeg - angle.deg); if (diff > 180) diff = 360 - diff;
        if (Math.abs(diff - asp.angle) <= ORB) {
          const w = Math.min((ASPECT_WEIGHTS[asp.name] || 2) - 1, 7);
          const dp = pName === 'NorthNode' ? 'North Node' : pName;
          angleCats.forEach(c => add(c, w, `SR ${dp} ${asp.name}s your natal ${angle.name}`));
        }
      }
    }
  }

  // ──── TERTIARY SIGNAL: Lunar phase ────────────────────────────
  const sun = natalChart.planets.Sun;
  if (sun) {
    const timeline = computeLunarPhaseTimeline(sun.sign, sun.degree, sun.minutes, natalChart.birthDate, srChart.solarReturnYear);
    const current = timeline.find(e => e.isCurrent);
    if (current) {
      (PHASE_BOOSTS[current.phase] || []).forEach(catId => add(catId, 4, `${current.phase} lunar phase supports this direction`));
    }
  }

  // ──── SR-to-Natal aspects (NOT SR internal aspects) ───────────
  // Only cross-chart aspects matter for category ranking.
  // SR internal aspects (e.g., SR Mars conjunct SR Mars) are expected
  // in Solar Returns and don't indicate specific life areas.
  for (const asp of (analysis.srToNatalAspects || [])) {
    // Skip Sun-Sun conjunction — it's the defining feature of every Solar Return
    if (asp.planet1 === 'Sun' && asp.planet2 === 'Sun') continue;
    
    // Use the HOUSE where these planets sit, not the planet's "nature"
    const p1House = analysis.planetSRHouses?.[asp.planet1];
    const p2NatalHouse = analysis.houseOverlays?.find(o => o.planet === asp.planet2)?.natalHouse;
    
    const w = Math.min(ASPECT_WEIGHTS[asp.type] || 2, 6);
    const p1 = asp.planet1 === 'NorthNode' ? 'North Node' : asp.planet1;
    const p2 = asp.planet2 === 'NorthNode' ? 'North Node' : asp.planet2;
    
    if (p1House) {
      const cat = HOUSE_TO_CATEGORY[p1House];
      if (cat) add(cat, w, `SR ${p1} (${p1House}${ordSuffix(p1House)} house) ${asp.type.toLowerCase()}s natal ${p2}`);
    }
    if (p2NatalHouse && p2NatalHouse !== p1House) {
      const cat = HOUSE_TO_CATEGORY[p2NatalHouse];
      if (cat) add(cat, w - 1, `Natal ${p2} (${p2NatalHouse}${ordSuffix(p2NatalHouse)} house) aspected by SR ${p1}`);
    }
  }

  // ──── Stacking bonus (3+ distinct signals → strong theme) ────
  for (const catId of Object.keys(scores)) {
    const uniqueSources = new Set(scores[catId].drivers.map(d => d.source));
    if (uniqueSources.size >= 3) {
      scores[catId].score += 5;
      scores[catId].drivers.push({ source: 'Multiple reinforcing signals point here', weight: 5 });
    }
  }

  // Build ranked
  return CATEGORIES.map(c => {
    const s = scores[c.id];
    const conf = s.score >= 28 ? 'Very High' : s.score >= 20 ? 'High' : s.score >= 12 ? 'Moderate' : 'Emerging';
    const uniqueDrivers: Driver[] = [];
    const seen = new Set<string>();
    for (const d of s.drivers) { if (!seen.has(d.source)) { seen.add(d.source); uniqueDrivers.push(d); } }
    const summary = buildSummary(c.id, c.label, uniqueDrivers);
    return { id: c.id, label: c.label, score: s.score, confidence: conf, drivers: uniqueDrivers, summary };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);
}
