import { useMemo } from 'react';
import { Trophy, TrendingUp, ChevronRight, HelpCircle } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeYearPriorities, ScoredCategory } from '@/lib/yearPriorityScoring';

const CONFIDENCE_COLORS: Record<string, string> = {
  'Very High': 'text-primary',
  'High': 'text-primary/80',
  'Moderate': 'text-foreground',
  'Emerging': 'text-muted-foreground',
};

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function YearPriorityEngine({ analysis, natalChart, srChart }: Props) {
  const rankedThemes = useMemo(() => {
    return computeYearPriorities(analysis, natalChart, srChart);
  }, [analysis, natalChart, srChart]);

    const add = (catId: string, weight: number, source: string) => {
      if (!scores[catId]) return;
      scores[catId].score += weight;
      scores[catId].drivers.push({ source, weight });
    };

    // Step 1: Sun house
    const sunH = analysis.sunHouse?.house;
    if (sunH) {
      const cat = HOUSE_TO_CATEGORY[sunH];
      if (cat) add(cat, 10, `SR Sun in ${sunH}${ord(sunH)} house`);
    }

    // Step 2: Moon house
    const moonH = analysis.moonHouse?.house;
    if (moonH) {
      const cat = HOUSE_TO_CATEGORY[moonH];
      if (cat) add(cat, 8, `SR Moon in ${moonH}${ord(moonH)} house`);
    }

    // Step 3: Lunar phase bonus
    const sun = natalChart.planets.Sun;
    let currentPhase = '';
    if (sun) {
      const timeline = computeLunarPhaseTimeline(sun.sign, sun.degree, sun.minutes, natalChart.birthDate, srChart.solarReturnYear);
      const current = timeline.find(e => e.isCurrent);
      if (current) {
        currentPhase = current.phase;
        const boosts = PHASE_BOOSTS[current.phase] || [];
        boosts.forEach(catId => add(catId, 5, `${current.phase} lunar phase`));
      }
    }

    // Step 4: House emphasis (SR houses with multiple planets)
    const srHouseCounts: Record<number, string[]> = {};
    for (const ov of analysis.houseOverlays || []) {
      if (ov.srHouse) {
        if (!srHouseCounts[ov.srHouse]) srHouseCounts[ov.srHouse] = [];
        srHouseCounts[ov.srHouse].push(ov.planet);
      }
    }
    for (const [h, planets] of Object.entries(srHouseCounts)) {
      const hNum = Number(h);
      const cat = HOUSE_TO_CATEGORY[hNum];
      if (cat && planets.length >= 2) {
        add(cat, 9, `${planets.length} planets in SR ${hNum}${ord(hNum)} house`);
        // Angular bonus
        if ([1, 4, 7, 10].includes(hNum)) {
          add(cat, 4, `Angular house emphasis (${hNum}${ord(hNum)})`);
        }
      }
    }

    // Step 5 & 6: Angle activations (SR angles → natal planets AND SR planets → natal angles)
    // SR angles
    const srAngles: { name: string; deg: number | null }[] = [];
    const srAsc = srChart.houseCusps?.house1;
    const srMC = srChart.houseCusps?.house10;
    if (srAsc) { const d = toAbsDeg(srAsc); srAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) srAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
    if (srMC) { const d = toAbsDeg(srMC); srAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) srAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

    // Natal angles
    const natalAngles: { name: string; deg: number | null }[] = [];
    const nAsc = natalChart.houseCusps?.house1;
    const nMC = natalChart.houseCusps?.house10;
    if (nAsc) { const d = toAbsDeg(nAsc); natalAngles.push({ name: 'Ascendant', deg: d }); if (d !== null) natalAngles.push({ name: 'Descendant', deg: (d + 180) % 360 }); }
    if (nMC) { const d = toAbsDeg(nMC); natalAngles.push({ name: 'Midheaven', deg: d }); if (d !== null) natalAngles.push({ name: 'IC', deg: (d + 180) % 360 }); }

    const srPlanets = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];
    const natalPlanets = srPlanets;

    // SR angles → natal planets
    for (const angle of srAngles) {
      if (angle.deg === null) continue;
      const angleCats = ANGLE_TO_CATEGORIES[angle.name] || [];
      for (const pName of natalPlanets) {
        const pos = natalChart.planets[pName as keyof typeof natalChart.planets];
        if (!pos) continue;
        const pDeg = toAbsDeg(pos);
        if (pDeg === null) continue;
        for (const asp of ASPECT_DEFS) {
          let diff = Math.abs(angle.deg - pDeg);
          if (diff > 180) diff = 360 - diff;
          if (Math.abs(diff - asp.angle) <= ORB) {
            const w = ASPECT_WEIGHTS[asp.name] || 3;
            const planetCats = PLANET_TO_CATEGORIES[pName] || [];
            const allCats = [...new Set([...angleCats, ...planetCats])];
            const dp = pName === 'NorthNode' ? 'North Node' : pName;
            allCats.forEach(c => add(c, w, `SR ${angle.name} ${asp.name} natal ${dp}`));
          }
        }
      }
    }

    // SR planets → natal angles
    for (const pName of srPlanets) {
      const srPos = srChart.planets[pName as keyof typeof srChart.planets];
      if (!srPos) continue;
      const srDeg = toAbsDeg(srPos);
      if (srDeg === null) continue;
      const planetCats = PLANET_TO_CATEGORIES[pName] || [];
      for (const angle of natalAngles) {
        if (angle.deg === null) continue;
        const angleCats = ANGLE_TO_CATEGORIES[angle.name] || [];
        for (const asp of ASPECT_DEFS) {
          let diff = Math.abs(srDeg - angle.deg);
          if (diff > 180) diff = 360 - diff;
          if (Math.abs(diff - asp.angle) <= ORB) {
            const w = (ASPECT_WEIGHTS[asp.name] || 3) - 1; // slightly less than angle-to-planet
            const allCats = [...new Set([...angleCats, ...planetCats])];
            const dp = pName === 'NorthNode' ? 'North Node' : pName;
            allCats.forEach(c => add(c, w, `SR ${dp} ${asp.name} natal ${angle.name}`));
          }
        }
      }
    }

    // Step 7: Natal house overlays
    for (const ov of analysis.houseOverlays || []) {
      if (ov.natalHouse) {
        const cat = HOUSE_TO_CATEGORY[ov.natalHouse];
        if (cat) add(cat, 9, `SR ${ov.planet} in natal ${ov.natalHouse}${ord(ov.natalHouse)} house`);
      }
    }
    // Sun/Moon natal houses
    if (analysis.sunNatalHouse?.house) {
      const cat = HOUSE_TO_CATEGORY[analysis.sunNatalHouse.house];
      if (cat) add(cat, 9, `SR Sun in natal ${analysis.sunNatalHouse.house}${ord(analysis.sunNatalHouse.house)} house`);
    }
    if (analysis.moonNatalHouse?.house) {
      const cat = HOUSE_TO_CATEGORY[analysis.moonNatalHouse.house];
      if (cat) add(cat, 9, `SR Moon in natal ${analysis.moonNatalHouse.house}${ord(analysis.moonNatalHouse.house)} house`);
    }

    // Step 8: Major SR aspects
    const allAspects = [...(analysis.srToNatalAspects || []), ...(analysis.srInternalAspects || [])];
    for (const asp of allAspects) {
      const w = ASPECT_WEIGHTS[asp.type] || 3;
      const p1Cats = PLANET_TO_CATEGORIES[asp.planet1] || [];
      const p2Cats = PLANET_TO_CATEGORIES[asp.planet2] || [];
      const allCats = [...new Set([...p1Cats, ...p2Cats])];
      allCats.forEach(c => add(c, w, `${asp.planet1}–${asp.planet2} ${asp.type.toLowerCase()}`));
    }

    // Step 9 & 10: Stacking & repeat bonuses
    for (const catId of Object.keys(scores)) {
      const driverCount = scores[catId].drivers.length;
      if (driverCount >= 3) {
        scores[catId].score += 6;
        scores[catId].drivers.push({ source: 'Stacked theme bonus (3+ signals)', weight: 6 });
      }
    }

    // Build ranked list
    const ranked: ScoredCategory[] = CATEGORIES.map(c => {
      const s = scores[c.id];
      const conf = getConfidence(s.score);
      // Deduplicate drivers by source
      const uniqueDrivers: Driver[] = [];
      const seen = new Set<string>();
      for (const d of s.drivers) {
        if (!seen.has(d.source)) { seen.add(d.source); uniqueDrivers.push(d); }
      }
      return {
        id: c.id,
        label: c.label,
        score: s.score,
        confidence: conf.label,
        confidenceColor: conf.color,
        drivers: uniqueDrivers.sort((a, b) => b.weight - a.weight),
      };
    })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);

    return ranked;
  }, [analysis, natalChart, srChart]);

  const top3 = rankedThemes.slice(0, 3);
  const rest = rankedThemes.slice(3);

  if (top3.length === 0) return null;

  const maxScore = top3[0]?.score || 1;

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Year Priority Engine</h3>
            <p className="text-xs text-muted-foreground">
              Top themes ranked by weighted signal strength
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Top 3 themes */}
        {top3.map((theme, i) => (
          <div key={theme.id} className={`rounded-sm p-4 ${i === 0 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30 border border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${i === 0 ? 'text-primary' : 'text-foreground'}`}>#{i + 1}</span>
                <span className="text-sm font-medium text-foreground">{theme.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-medium ${theme.confidenceColor}`}>
                  {theme.confidence}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{theme.score}pts</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${i === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                style={{ width: `${Math.min(100, (theme.score / maxScore) * 100)}%` }}
              />
            </div>

            {/* Drivers */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <TrendingUp size={10} /> Key Drivers
              </p>
              {theme.drivers.slice(0, 4).map((d, di) => (
                <p key={di} className="text-xs text-muted-foreground flex items-center gap-1">
                  <ChevronRight size={10} className="flex-shrink-0" />
                  {d.source}
                  <span className="text-muted-foreground/50 font-mono ml-auto">+{d.weight}</span>
                </p>
              ))}
              {theme.drivers.length > 4 && (
                <p className="text-[10px] text-muted-foreground/50">
                  +{theme.drivers.length - 4} more signals
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Remaining themes (compact) */}
        {rest.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Other Active Themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {rest.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between text-xs text-muted-foreground py-1 px-2 bg-muted/20 rounded-sm">
                  <span>{theme.label}</span>
                  <span className="font-mono text-[10px]">{theme.score}pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Method note */}
        <div className="flex items-start gap-1.5 pt-2 border-t border-border">
          <HelpCircle size={10} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Scores combine SR house placements, natal house overlays, angle-to-planet contacts, planet-to-angle contacts, major aspects, lunar phase, and stacking bonuses. Higher scores indicate stronger, more repeated signals pointing to the same life area.
          </p>
        </div>
      </div>
    </div>
  );
}

function ord(n: number): string {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}
