import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  PLANETS, 
  SIGNS, 
  HOUSES, 
  ASPECTS,
  POINTS,
  CATEGORIES,
  findCombinations, 
  findByCategory,
  getAllCombinations,
  findExactCombination,
  CombinationEntry 
} from '@/lib/planetaryCombinations';
import { Sun, Moon, X, Sparkles, AlertTriangle, Heart, Zap, BookOpen, Filter, User, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { NatalChart } from '@/hooks/useNatalChart';
import { getNatalPlanetHouse } from '@/lib/houseCalculations';
import { 
  RETROGRADE_PLANET_MODIFIERS, 
  getRetrogradeInterpretation,
  RETROGRADE_SIGN_COMBOS 
} from '@/lib/retrogradeSignCombinations';
import { findAspectModifiers, ASPECT_SYMBOLS, AspectModifier } from '@/lib/aspectModifiers';
import { patternMirrorCombos, THEMATIC_CATEGORIES, PatternMirrorCombo } from '@/lib/patternMirrorCombos';
import { PatternMirrorCard } from '@/components/PatternMirrorCard';
import { ChartSelector } from '@/components/ChartSelector';

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

interface CombosViewProps {
  className?: string;
  savedCharts?: NatalChart[];
  userChart?: NatalChart | null;
}

export const CombosView = ({ className = '', savedCharts = [], userChart = null }: CombosViewProps) => {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'browse' | 'patterns'>('explore');
  const [selectedThematicTag, setSelectedThematicTag] = useState<string | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  // Track which Pattern Mirror to highlight after navigating from Combos
  const [highlightedPatternId, setHighlightedPatternId] = useState<string | null>(null);
  // Individual retrograde checkboxes for each planet (manual selection)
  const [manualRetrogrades, setManualRetrogrades] = useState<Set<string>>(new Set());
  // Aspect type filter
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<string | null>(null);
  // Combine all available charts
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userChart) charts.push(userChart);
    charts.push(...savedCharts);
    return charts;
  }, [userChart, savedCharts]);

  // Get the selected chart
  // NOTE: ChartSelector uses the special id "user" for the primary chart.
  // Many views rely on that behavior, so we map it back to the actual userChart here.
  const selectedChart = useMemo(() => {
    if (!selectedChartId) return null;
    if (selectedChartId === 'user') return userChart;
    return allCharts.find((c) => c.id === selectedChartId) || null;
  }, [selectedChartId, allCharts, userChart]);

  // Helper to calculate aspect between two planets
  const calculateAspect = (
    planet1Sign: string, planet1Degree: number,
    planet2Sign: string, planet2Degree: number
  ): string | null => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    const long1 = signs.indexOf(planet1Sign) * 30 + planet1Degree;
    const long2 = signs.indexOf(planet2Sign) * 30 + planet2Degree;
    
    let diff = Math.abs(long1 - long2);
    if (diff > 180) diff = 360 - diff;
    
   // Check aspects with wider orbs (10° for major aspects to catch outer planet aspects)
   if (diff <= 10) return 'Conjunction'; // 0° with 10° orb
   if (diff >= 54 && diff <= 66) return 'Sextile'; // 60° with 6° orb
   if (diff >= 80 && diff <= 100) return 'Square'; // 90° with 10° orb
   if (diff >= 110 && diff <= 130) return 'Trine'; // 120° with 10° orb
   if (diff >= 170 && diff <= 190) return 'Opposition'; // 180° with 10° orb
    
    return null;
  };

  const getChartPos = (planetName: string) => {
    if (!selectedChart) return null;

    // IMPORTANT: For angles/points, prefer house cusp data when present.
    // This avoids mismatches when a chart import/OCR captured the DC instead of AC.
    if (planetName === 'Ascendant') {
      const cusp1 = selectedChart.houseCusps?.house1;
      if (cusp1?.sign) {
        const degNum = typeof cusp1.degree === 'number' ? cusp1.degree : Number(cusp1.degree);
        const minNum = typeof cusp1.minutes === 'number' ? cusp1.minutes : Number(cusp1.minutes);
        const safeDeg = Number.isFinite(degNum) ? degNum : 0;
        const safeMin = Number.isFinite(minNum) ? minNum : 0;
        return { sign: cusp1.sign, degree: safeDeg + safeMin / 60 };
      }
    }

    const pos = selectedChart.planets?.[planetName as keyof NatalChart['planets']];
    if (!pos?.sign) return null;
    const degNum = typeof pos.degree === 'number' ? pos.degree : Number(pos.degree);
    const minNum = typeof pos.minutes === 'number' ? pos.minutes : Number(pos.minutes);
    const secNum = typeof pos.seconds === 'number' ? pos.seconds : Number(pos.seconds);
    const safeDeg = Number.isFinite(degNum) ? degNum : 0;
    const safeMin = Number.isFinite(minNum) ? minNum : 0;
    const safeSec = Number.isFinite(secNum) ? secNum : 0;

    const deg = safeDeg + safeMin / 60 + safeSec / 3600;
    return { sign: pos.sign, degree: deg };
  };

  // Extract factors from the selected chart (planet-sign, planet-house, and planet-planet aspects)
  // IMPORTANT: Use getChartPos() for ALL points so AC always comes from house cusps (house1) when present.
  const chartFactors = useMemo(() => {
    if (!selectedChart) return new Set<string>();

    const factors = new Set<string>();
    const names = [...PLANETS, ...POINTS];
    const planetData: { name: string; sign: string; degree: number }[] = [];

    for (const name of names) {
      const pos = getChartPos(name);
      if (!pos?.sign) continue;

      planetData.push({ name, sign: pos.sign, degree: pos.degree });

      // Add planet-sign combo identifier
      factors.add(`${name}|${pos.sign}`);
      // Also track individual factors
      factors.add(name);
      factors.add(pos.sign);

      // Calculate and add planet-house combo (for points like Ascendant this should still work)
      const house = getNatalPlanetHouse(name, selectedChart);
      if (house) {
        const houseLabel = `${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} House`;
        factors.add(`${name}|${houseLabel}`);
        factors.add(houseLabel);
      }
    }

    // Calculate actual aspects between planets/points
    for (let i = 0; i < planetData.length; i++) {
      for (let j = i + 1; j < planetData.length; j++) {
        const p1 = planetData[i];
        const p2 = planetData[j];
        const aspect = calculateAspect(p1.sign, p1.degree, p2.sign, p2.degree);
        if (aspect) {
          // Add both orderings so matching works either way
          factors.add(`${p1.name}|${p2.name}|${aspect}`);
          factors.add(`${p2.name}|${p1.name}|${aspect}`);
        }
      }
    }

    return factors;
  }, [selectedChart]);

  // Extract aspects with planet pairs for the aspect filter UI
  const chartAspects = useMemo(() => {
    if (!selectedChart) {
      return {
        byType: new Map<string, string[]>(),
        allAspectTypes: [] as string[],
        allPairs: [] as { p1: string; p2: string; aspect: string }[],
      };
    }

    const byType = new Map<string, string[]>();
    const allPairs: { p1: string; p2: string; aspect: string }[] = [];
    const names = [...PLANETS, ...POINTS];
    const planetData: { name: string; sign: string; degree: number }[] = [];

    for (const name of names) {
      const pos = getChartPos(name);
      if (!pos?.sign) continue;
      planetData.push({ name, sign: pos.sign, degree: pos.degree });
    }

    for (let i = 0; i < planetData.length; i++) {
      for (let j = i + 1; j < planetData.length; j++) {
        const p1 = planetData[i];
        const p2 = planetData[j];
        const aspect = calculateAspect(p1.sign, p1.degree, p2.sign, p2.degree);
        if (aspect) {
          if (!byType.has(aspect)) byType.set(aspect, []);
          byType.get(aspect)!.push(`${p1.name}-${p2.name}`);
          allPairs.push({ p1: p1.name, p2: p2.name, aspect });
        }
      }
    }

    const allAspectTypes = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'].filter((a) => byType.has(a));
    return { byType, allAspectTypes, allPairs };
  }, [selectedChart]);

  // Calculate aspect modifier coverage for the chart
  const aspectCoverage = useMemo(() => {
    if (!chartAspects.allPairs.length) return { withModifiers: [], universal: [] };
    
    const withModifiers: { p1: string; p2: string; aspect: string; modifierName: string }[] = [];
    const universal: { p1: string; p2: string; aspect: string }[] = [];
    
    for (const pair of chartAspects.allPairs) {
      const modifier = findAspectModifiers(pair.p1, pair.p2);
      if (modifier) {
        const specificAspect = modifier.aspects.find(a => a.aspectType === pair.aspect);
        withModifiers.push({
          ...pair,
          modifierName: specificAspect?.name || modifier.coreSignature
        });
      } else {
        universal.push(pair);
      }
    }
    
    return { withModifiers, universal };
  }, [chartAspects.allPairs]);


  const retrogradePlanets = useMemo(() => {
    if (!selectedChart?.planets) return new Map<string, { sign: string; house?: number }>();
    
    const retros = new Map<string, { sign: string; house?: number }>();
    const planetNames = Object.keys(selectedChart.planets) as (keyof typeof selectedChart.planets)[];
    
    for (const planetName of planetNames) {
      const data = selectedChart.planets[planetName];
      if (!data?.sign || !data.isRetrograde) continue;
      
      const house = getNatalPlanetHouse(planetName, selectedChart);
      retros.set(planetName, { sign: data.sign, house: house || undefined });
    }
    
    return retros;
  }, [selectedChart]);

  // Check if a combination matches the selected chart
  const doesComboMatchChart = (combo: CombinationEntry): boolean => {
    if (!selectedChart || chartFactors.size === 0) return false;
    
    // Include POINTS (Ascendant, Midheaven, etc.) along with planets for matching
    const comboBodies = combo.factors.filter(f => PLANETS.includes(f) || POINTS.includes(f));
    const comboPlanets = combo.factors.filter(f => PLANETS.includes(f));
    const comboSigns = combo.factors.filter(f => SIGNS.includes(f));
    const comboHouses = combo.factors.filter(f => HOUSES.includes(f));
    const comboAspects = combo.factors.filter(f => ASPECTS.includes(f));
    
    // For body-sign combos (planet OR point in sign), check if the chart has that body in that sign
    // This handles cases like ['Ascendant', 'Virgo'] or ['Mercury', 'Aquarius']
    if (comboBodies.length === 1 && comboSigns.length === 1 && comboHouses.length === 0) {
      return chartFactors.has(`${comboBodies[0]}|${comboSigns[0]}`);
    }
    
    // For planet-house combos, check if the chart has that planet in that house
    if (comboPlanets.length === 1 && comboHouses.length === 1 && comboSigns.length === 0) {
      return chartFactors.has(`${comboPlanets[0]}|${comboHouses[0]}`);
    }
    
    // For planet-sign-house combos, check both
    if (comboPlanets.length === 1 && comboSigns.length === 1 && comboHouses.length === 1) {
      return chartFactors.has(`${comboPlanets[0]}|${comboSigns[0]}`) && 
             chartFactors.has(`${comboPlanets[0]}|${comboHouses[0]}`);
    }
    
    // For planet-planet-aspect combos, check if that actual aspect exists
    if (comboPlanets.length === 2 && comboAspects.length === 1) {
      const [p1, p2] = comboPlanets;
      const aspect = comboAspects[0];
      return chartFactors.has(`${p1}|${p2}|${aspect}`) || chartFactors.has(`${p2}|${p1}|${aspect}`);
    }
    
    // For planet-planet combos WITHOUT an aspect specified, 
    // check if they form ANY major aspect (this is a match if they're actually aspected)
    if (comboPlanets.length === 2 && comboAspects.length === 0 && comboSigns.length === 0 && comboHouses.length === 0) {
      const [p1, p2] = comboPlanets;
      // Check for any major aspect between these planets
      return ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'].some(
        aspect => chartFactors.has(`${p1}|${p2}|${aspect}`) || chartFactors.has(`${p2}|${p1}|${aspect}`)
      );
    }
    
    // For multi-planet + house combos (e.g., Mars-Pluto in 8th House):
    // EACH planet must be in that house AND they must aspect each other
    if (comboPlanets.length >= 2 && comboHouses.length === 1) {
      const house = comboHouses[0];
      // Check that ALL planets in the combo are actually in that house
      const allPlanetsInHouse = comboPlanets.every(p => chartFactors.has(`${p}|${house}`));
      if (!allPlanetsInHouse) return false;
      
      // Also check for aspect between the planets
      const [p1, p2] = comboPlanets;
      const hasAspect = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'].some(
        aspect => chartFactors.has(`${p1}|${p2}|${aspect}`) || chartFactors.has(`${p2}|${p1}|${aspect}`)
      );
      return hasAspect;
    }
    
    // For multi-planet + sign combos (e.g., Venus-Jupiter in 2nd House equivalent in sign):
    // EACH planet must be in that sign AND they must aspect each other
    if (comboPlanets.length >= 2 && comboSigns.length === 1 && comboHouses.length === 0) {
      const sign = comboSigns[0];
      // Check that ALL planets in the combo are in that sign
      const allPlanetsInSign = comboPlanets.every(p => chartFactors.has(`${p}|${sign}`));
      if (!allPlanetsInSign) return false;
      
      // Also check for aspect between the planets
      const [p1, p2] = comboPlanets;
      const hasAspect = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'].some(
        aspect => chartFactors.has(`${p1}|${p2}|${aspect}`) || chartFactors.has(`${p2}|${p1}|${aspect}`)
      );
      return hasAspect;
    }
    
    // For single planet/body entries (like "Saturn"), don't auto-match - too generic
    if (comboBodies.length === 1 && comboSigns.length === 0 && comboHouses.length === 0 && comboAspects.length === 0) {
      return false; // Single body entries are too generic to match
    }
    
    // For other combinations (e.g., planet+aspect only, or complex multi-factor),
    // require EACH planet to be individually validated for any sign/house claims
    // Don't blindly match if we can't verify properly
    if (comboPlanets.length >= 2) {
      // For multi-planet combos with no house/sign, just check aspect exists
      const [p1, p2] = comboPlanets;
      return ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'].some(
        aspect => chartFactors.has(`${p1}|${p2}|${aspect}`) || chartFactors.has(`${p2}|${p1}|${aspect}`)
      );
    }
    
    // For remaining combos with bodies + factors, check the body-sign/house relationship exists
    // This should NOT fall through to matching individual factors separately
    if (comboBodies.length === 1 && (comboSigns.length === 1 || comboHouses.length === 1)) {
      // Already handled above - if we got here, it means the pattern didn't match
      return false;
    }
    
    // For other multi-factor combos without clear body, be conservative - require all factors
    return combo.factors.every(f => chartFactors.has(f));
  };

  const TRANSIT_PREFIX = 'Transit ';
  const transitPlanets = useMemo(() => PLANETS.map(p => `${TRANSIT_PREFIX}${p}`), []);

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => {
      // If clicking the same factor, remove it
      if (prev.includes(factor)) {
        return prev.filter(f => f !== factor);
      }
      
      // Check if this is a house - a planet can only be in one house at a time
      const isHouse = HOUSES.includes(factor);
      if (isHouse) {
        // Remove any previously selected house before adding the new one
        const withoutOtherHouses = prev.filter(f => !HOUSES.includes(f));
        return [...withoutOtherHouses, factor];
      }
      
      // Check if this is a sign - a planet can only be in one sign at a time
      const isSign = SIGNS.includes(factor);
      if (isSign) {
        // Remove any previously selected sign before adding the new one
        const withoutOtherSigns = prev.filter(f => !SIGNS.includes(f));
        return [...withoutOtherSigns, factor];
      }
      
      return [...prev, factor];
    });
    // Clear category when selecting factors
    setSelectedCategory(null);
  };

  const normalizeFactor = (factor: string) => {
    if (factor.startsWith(TRANSIT_PREFIX)) return factor.slice(TRANSIT_PREFIX.length);
    return factor;
  };

  const hasTransitContext = (factors: string[]) => factors.some(f => f.startsWith(TRANSIT_PREFIX));

  const synthesizeInterpretation = (rawFactors: string[]): CombinationEntry | null => {
    const factors = rawFactors.map(normalizeFactor);
    const transit = hasTransitContext(rawFactors);

    // If we can find an exact multi-factor entry, prefer that
    const exact = findExactCombination(factors);
    if (exact) return exact;

    // Build smaller, known sub-combos (planet+sign, planet+house, planet+planet+aspect)
    const planets = factors.filter(f => PLANETS.includes(f));
    const signs = factors.filter(f => SIGNS.includes(f));
    const houses = factors.filter(f => HOUSES.includes(f));
    const aspects = factors.filter(f => ASPECTS.includes(f));

    const subCombos: CombinationEntry[] = [];

    // planet+sign
    for (const p of planets) {
      for (const s of signs) {
        const c = findExactCombination([p, s]);
        if (c) subCombos.push(c);
      }
    }

    // planet+house
    for (const p of planets) {
      for (const h of houses) {
        const c = findExactCombination([p, h]);
        if (c) subCombos.push(c);
      }
    }

    // planet-planet aspect
    if (planets.length >= 2 && aspects.length >= 1) {
      const [p1, p2] = planets;
      const aspect = aspects[0];
      const c = findExactCombination([p1, p2, aspect]) || findExactCombination([p2, p1, aspect]);
      if (c) subCombos.push(c);
    }

    // If still nothing, give a generic but useful synthesis
    if (subCombos.length === 0) {
      if (planets.length === 0) return null;

      const titleBits = [
        transit ? 'Transit Synthesis' : 'Synthesis',
        ...planets.slice(0, 3),
        ...signs.slice(0, 2),
        ...houses.slice(0, 1),
        ...aspects.slice(0, 1),
      ].filter(Boolean);

      return {
        id: `synth-${factors.join('-').toLowerCase().replace(/\s+/g, '-')}`,
        factors,
        title: titleBits.join(' • '),
        summary: transit
          ? 'No exact transit write-up exists yet for this full combination. Below is a synthesized reading using the closest matching building blocks from the library.'
          : 'No exact write-up exists yet for this full combination. Below is a synthesized reading using the closest matching building blocks from the library.',
        energies: [
          { expression: 'Interpret as layers: planet(s) + sign tone + house context + aspect style.', polarity: 'neutral' },
          { expression: 'If this is a child chart: prioritize regulation, learning style, and environment fit over labels.', polarity: 'light' },
          { expression: 'If this is a transit: expect timing and mood shifts rather than fixed personality traits.', polarity: 'neutral' },
        ],
        tags: transit ? ['transit'] : ['neutral'],
      };
    }

    // Merge sub-combos into a single card
    const unique = (arr: string[]) => Array.from(new Set(arr));
    const mergedEnergies = unique(
      subCombos.flatMap(c => c.energies.map(e => `${e.polarity}::${e.expression}`))
    )
      .slice(0, 14)
      .map(s => {
        const [polarity, expression] = s.split('::') as [CombinationEntry['energies'][number]['polarity'], string];
        return { polarity, expression };
      });

    const summaryParts = unique(subCombos.map(c => c.summary)).slice(0, 4);

    return {
      id: `synth-${factors.join('-').toLowerCase().replace(/\s+/g, '-')}`,
      factors,
      title: transit ? 'Transit Synthesis' : 'Synthesis',
      summary:
        (transit
          ? 'Transit context: interpret this as a timing/seasonal influence. ' 
          : '') +
        summaryParts.join(' '),
      energies: mergedEnergies,
      tags: transit ? ['transit'] : undefined,
    };
  };

  const toggleCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      // Clear factors when selecting category
      setSelectedFactors([]);
    }
  };

  const clearAll = () => {
    setSelectedFactors([]);
    setSelectedCategory(null);
    setSelectedAspectFilter(null);
  };

  const allCombinations = useMemo(() => getAllCombinations(), []);

  // Get all combinations that match the selected chart
  const chartMatchingCombinations = useMemo(() => {
    if (!selectedChart || chartFactors.size === 0) return [];
    return allCombinations.filter(combo => doesComboMatchChart(combo));
  }, [selectedChart, chartFactors, allCombinations]);

  // Helper to check if combo involves a specific aspect type
  const comboHasAspectType = (combo: CombinationEntry, aspectType: string): boolean => {
    // Check if the combo factors directly include the aspect
    if (combo.factors.includes(aspectType)) return true;
    
    // For 2-planet combos without explicit aspect, check if they form that aspect in the chart
    const comboPlanets = combo.factors.filter(f => PLANETS.includes(f));
    if (comboPlanets.length === 2) {
      const [p1, p2] = comboPlanets;
      return chartFactors.has(`${p1}|${p2}|${aspectType}`) || chartFactors.has(`${p2}|${p1}|${aspectType}`);
    }
    return false;
  };

  const matchingCombinations = useMemo(() => {
    let results: CombinationEntry[] = [];
    
    // If a chart is selected and no other filters, show all chart matches
    if (selectedChartId && selectedFactors.length === 0 && !selectedCategory) {
      results = chartMatchingCombinations;
    } else if (selectedCategory) {
      results = findByCategory(selectedCategory);
    } else if (selectedFactors.length === 0) {
      return [];
    } else {
      const normalized = selectedFactors.map(normalizeFactor);
      const found = findCombinations(normalized);
      if (found.length > 0) {
        results = found;
      } else {
        const synth = synthesizeInterpretation(selectedFactors);
        return synth ? [synth] : [];
      }
    }
    
    // Apply aspect type filter if selected
    if (selectedAspectFilter && results.length > 0) {
      results = results.filter(combo => comboHasAspectType(combo, selectedAspectFilter));
    }
    
    return results;
  }, [selectedFactors, selectedCategory, selectedChartId, chartMatchingCombinations, selectedAspectFilter, chartFactors]);

  const renderFactorButton = (factor: string, symbol?: string) => {
    const isSelected = selectedFactors.includes(factor);
    return (
      <button
        key={factor}
        onClick={() => toggleFactor(factor)}
        className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
          isSelected 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-background border-border hover:border-primary/50 hover:bg-secondary'
        }`}
      >
        {symbol && <span className="mr-1">{symbol}</span>}
        {factor}
      </button>
    );
  };

  const renderCombinationCard = (combo: CombinationEntry) => {
    const lightEnergies = combo.energies.filter(e => e.polarity === 'light');
    const shadowEnergies = combo.energies.filter(e => e.polarity === 'shadow');
    const neutralEnergies = combo.energies.filter(e => e.polarity === 'neutral');
    const isMatch = doesComboMatchChart(combo);
    
    // Check if any planet in this combo is retrograde (from chart OR manual selection)
    const comboPlanets = combo.factors.filter(f => PLANETS.includes(f));
    const chartRetroInCombo = comboPlanets.filter(p => retrogradePlanets.has(p));
    const manualRetroInCombo = comboPlanets.filter(p => manualRetrogrades.has(p));
    const retrogradeInCombo = [...new Set([...chartRetroInCombo, ...manualRetroInCombo])];
    const hasRetrogradeContext = retrogradeInCombo.length > 0;

    // Check for aspect modifiers for planet-planet combos
    const getAspectModifierData = () => {
      if (comboPlanets.length !== 2) return null;
      
      const [p1, p2] = comboPlanets;
      const modifierPair = findAspectModifiers(p1, p2);
      if (!modifierPair) return null;
      
      // Find what aspect this pair has in the selected chart (compute directly so the label never goes missing)
      let userAspectType: string | null = null;
      if (selectedChart) {
        const p1Pos = getChartPos(p1);
        const p2Pos = getChartPos(p2);
        if (p1Pos && p2Pos) {
          userAspectType = calculateAspect(p1Pos.sign, p1Pos.degree, p2Pos.sign, p2Pos.degree);
        }
      }
      
      return {
        pair: modifierPair,
        userAspect: userAspectType,
        userModifier: userAspectType && modifierPair
          ? modifierPair.aspects.find(a => a.aspectType === userAspectType) || null
          : null
      };
    };
    
    const aspectModifierData = getAspectModifierData();

    // Find related Pattern Mirror combos for this Combo entry
    const getRelatedPatternMirrors = () => {
      const related: { id: string; title: string }[] = [];
      for (const pm of patternMirrorCombos) {
        // Match on overlapping planets
        if (pm.planets && pm.planets.length > 0) {
          const overlap = pm.planets.filter(p => comboPlanets.includes(p));
          if (overlap.length >= (pm.planets.length >= 2 ? 2 : 1)) {
            related.push({ id: pm.id, title: pm.title });
          }
        }
      }
      return related;
    };
    const relatedPatternMirrors = getRelatedPatternMirrors();
    return (
      <Card key={combo.id} className={`border-border ${isMatch ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {isMatch && (
                  <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                    <Check className="h-3 w-3" />
                    In Your Chart
                  </Badge>
                )}
                {hasRetrogradeContext && (
                  <Badge className="bg-warning/20 text-warning text-xs gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Retrograde
                  </Badge>
                )}
                {combo.factors.map((factor, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {PLANETS.includes(factor) ? getPlanetSymbol(factor) : SIGN_SYMBOLS[factor] || ''}{' '}
                    {factor}
                    {retrogradeInCombo.includes(factor) && ' ℞'}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg font-serif">{combo.title}</CardTitle>
            </div>
            {combo.tags?.includes('warning') && (
              <div className="relative group">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 cursor-help" />
                <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block w-48 p-2 bg-popover border border-border rounded-md shadow-lg text-xs text-muted-foreground">
                  {combo.tags?.includes('detriment') 
                    ? "Detriment placement—requires conscious effort but offers deep mastery potential"
                    : combo.tags?.includes('fall')
                    ? "Fall placement—confidence is earned through practice and patience"
                    : "This placement has growth challenges that become strengths with awareness"}
                </div>
              </div>
            )}
            {combo.tags?.includes('wealth') && (
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {aspectModifierData ? aspectModifierData.pair.coreDescription : combo.summary}
          </p>

           {/* Aspect-Specific Expression - Show when we have aspect modifier data */}
           {aspectModifierData?.pair && (
            <div className="space-y-3">
              {/* Universal Learning Traits - show if available */}
              {aspectModifierData.pair.universalLearningTraits && aspectModifierData.pair.universalLearningTraits.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-medium text-primary uppercase tracking-wide">Universal Learning Traits</h4>
                  </div>
                  <ul className="space-y-1">
                    {aspectModifierData.pair.universalLearningTraits.map((trait, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {trait}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

               {/* User's specific aspect (always show the aspect identifier when we can compute it) */}
               {selectedChart && aspectModifierData.userAspect && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                       {ASPECT_SYMBOLS[aspectModifierData.userAspect]} {aspectModifierData.userAspect} in Your Chart
                    </Badge>
                  </div>
                   {aspectModifierData.userModifier ? (
                     <>
                       <h4 className="font-medium text-sm mb-1">{aspectModifierData.userModifier.name}</h4>
                       <p className="text-xs text-primary italic mb-2">{aspectModifierData.userModifier.tone}</p>
                       <p className="text-sm text-foreground/80 mb-3">{aspectModifierData.userModifier.description}</p>
                     </>
                   ) : (
                     <p className="text-xs text-muted-foreground">
                       This aspect exists in your chart, but we don’t have an aspect-specific writeup for this exact angle yet.
                       You’re seeing the universal signature above.
                     </p>
                   )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-medium text-primary mb-1">Your Gifts:</h5>
                      <ul className="space-y-0.5">
                         {(aspectModifierData.userModifier?.gifts || []).map((gift, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                            <span className="text-primary">✦</span> {gift}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-destructive mb-1">Your Challenges:</h5>
                      <ul className="space-y-0.5">
                         {(aspectModifierData.userModifier?.challenges || []).map((challenge, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                            <span className="text-destructive">•</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Learning Style for this aspect */}
                   {aspectModifierData.userModifier?.learningStyle && (
                    <div className="mt-4 pt-3 border-t border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <h5 className="text-xs font-medium text-primary">
                          Your Learning Style: {aspectModifierData.userModifier.learningStyle.name}
                        </h5>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <h6 className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Best Methods:</h6>
                          <ul className="space-y-0.5">
                            {aspectModifierData.userModifier.learningStyle.bestMethods.map((method, i) => (
                              <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                                <span className="text-primary">✓</span> {method}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Avoid:</h6>
                          <ul className="space-y-0.5">
                            {aspectModifierData.userModifier.learningStyle.avoid.map((item, i) => (
                              <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                                <span className="text-destructive">✕</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-2">
                        💡 {aspectModifierData.userModifier.learningStyle.designNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* All aspects dropdown */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="aspects" className="border-border">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:text-foreground py-2">
                    <span className="flex items-center gap-2">
                      <span>View all aspect expressions</span>
                      <span className="text-[10px] text-muted-foreground">
                        ☌ ⚹ □ △ ☍
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {aspectModifierData.pair.aspects.map((aspect) => (
                        <div 
                          key={aspect.aspectType} 
                          className={`p-3 rounded-lg border ${
                            aspectModifierData.userAspect === aspect.aspectType 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium flex items-center gap-2">
                              <span className="text-lg">{aspect.symbol}</span>
                              {aspect.name}
                              {aspectModifierData.userAspect === aspect.aspectType && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 border-primary/30">
                                  Your Aspect
                                </Badge>
                              )}
                            </h5>
                          </div>
                          <p className="text-xs italic text-muted-foreground mb-2">{aspect.tone}</p>
                          <p className="text-xs text-foreground/70 mb-2">{aspect.description}</p>
                          
                          {/* Learning style in accordion - show for each aspect */}
                          {aspect.learningStyle && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-[10px] font-medium text-primary mb-1">
                                📚 {aspect.learningStyle.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground italic">
                                {aspect.learningStyle.designNote}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          
          {/* Retrograde Energy Section - show when planet has retrograde context */}
          {hasRetrogradeContext && retrogradeInCombo.map(planet => {
            // Get sign context from chart or selected factors
            const chartInfo = retrogradePlanets.get(planet);
            const selectedSign = selectedFactors.find(f => SIGNS.includes(f));
            const signForInterpretation = chartInfo?.sign || selectedSign || null;
            
            if (!signForInterpretation) {
              // Just show generic retrograde info without sign
              const modifier = RETROGRADE_PLANET_MODIFIERS[planet];
              if (!modifier) return null;
              
              return (
                <div key={planet} className="space-y-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="text-xs font-medium text-warning flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {getPlanetSymbol(planet)} {planet} Retrograde
                  </h4>
                  <p className="text-sm text-foreground/80 italic">
                    {modifier.internal}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-medium text-primary mb-1">Retrograde Gifts:</h5>
                      <ul className="space-y-0.5">
                        {modifier.coreGifts.slice(0, 3).map((gift, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                            <span className="text-primary">✦</span> {gift}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-destructive mb-1">Challenges:</h5>
                      <ul className="space-y-0.5">
                        {modifier.coreChallenges.slice(0, 3).map((challenge, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                            <span className="text-destructive">•</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Get specific retrograde+sign interpretation
            const interpretation = getRetrogradeInterpretation(planet, signForInterpretation);
            
            return (
              <div key={planet} className="space-y-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <h4 className="text-xs font-medium text-warning flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {getPlanetSymbol(planet)} {planet} ℞ in {SIGN_SYMBOLS[signForInterpretation]} {signForInterpretation}
                  {chartInfo?.house && ` (${chartInfo.house}${chartInfo.house === 1 ? 'st' : chartInfo.house === 2 ? 'nd' : chartInfo.house === 3 ? 'rd' : 'th'} House)`}
                </h4>
                
                {interpretation.signCombo ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{interpretation.signCombo.title}</p>
                    <p className="text-sm text-foreground/80 italic">{interpretation.signCombo.internalExpression}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-medium text-primary mb-1">Retrograde Gifts:</h5>
                        <ul className="space-y-0.5">
                          {interpretation.signCombo.gifts.slice(0, 4).map((gift, i) => (
                            <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                              <span className="text-primary">✦</span> {gift}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-destructive mb-1">Challenges:</h5>
                        <ul className="space-y-0.5">
                          {interpretation.signCombo.challenges.slice(0, 4).map((challenge, i) => (
                            <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                              <span className="text-destructive">•</span> {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {interpretation.signCombo.sources && (
                      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                        Sources: {interpretation.signCombo.sources.join(', ')}
                      </p>
                    )}
                  </>
                ) : interpretation.modifier ? (
                  <>
                    <p className="text-sm text-foreground/80 italic">
                      {interpretation.synthesizedInterpretation || interpretation.modifier.internal}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-medium text-primary mb-1">Retrograde Gifts:</h5>
                        <ul className="space-y-0.5">
                          {interpretation.modifier.coreGifts.slice(0, 3).map((gift, i) => (
                            <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                              <span className="text-primary">✦</span> {gift}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-destructive mb-1">Challenges:</h5>
                        <ul className="space-y-0.5">
                          {interpretation.modifier.coreChallenges.slice(0, 3).map((challenge, i) => (
                            <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                              <span className="text-destructive">•</span> {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}

          {/* Light Expressions */}
          {lightEnergies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5" />
                Light Expressions
              </h4>
              <ul className="space-y-1">
                {lightEnergies.map((energy, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {energy.expression}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Neutral Expressions */}
          {neutralEnergies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-accent-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Core Expressions
              </h4>
              <ul className="space-y-1">
                {neutralEnergies.map((energy, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-accent-foreground mt-1">•</span>
                    {energy.expression}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shadow Expressions */}
          {shadowEnergies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-destructive flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5" />
                Shadow Expressions
              </h4>
              <ul className="space-y-1">
                {shadowEnergies.map((energy, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    {energy.expression}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {combo.tags && combo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
              {combo.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Sources */}
          {combo.sources && combo.sources.length > 0 && (
            <div className="text-[10px] text-muted-foreground pt-2">
              Sources: {combo.sources.join(', ')}
            </div>
          )}

          {/* Related Pattern Mirror link */}
          {relatedPatternMirrors.length > 0 && (
            <div className="pt-3 border-t border-border mt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Related Pattern Mirror</p>
              <div className="flex flex-wrap gap-2">
                {relatedPatternMirrors.slice(0, 3).map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => {
                      setActiveTab('patterns');
                      setSelectedThematicTag('__MY_MATCHES__');
                      setHighlightedPatternId(pm.id);
                      // Scroll to the pattern after a short delay (allow tab to render)
                      setTimeout(() => {
                        const el = document.getElementById(`pattern-mirror-${pm.id}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 150);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 border border-border hover:border-primary/50 transition-colors flex items-center gap-1"
                  >
                    <Moon className="h-3 w-3" />
                    {pm.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-border">
        <h2 className="text-2xl font-serif text-foreground">Planetary Combinations</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Select any number of factors (planets, signs, houses, aspects) or filter by category to discover their combined meaning.
        </p>
      </div>

      {/* My Chart Matches Selector */}
      {allCharts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">My Chart Matches:</span>
              </div>
              <ChartSelector
                userNatalChart={userChart}
                savedCharts={savedCharts}
                selectedChartId={selectedChartId || 'general'}
                onSelect={(v) => setSelectedChartId(v === 'general' ? null : v)}
                includeGeneral={true}
                generalLabel="✦ Collective Energies"
              />
              {selectedChart && (
                <span className="text-xs text-muted-foreground">
                  Combinations in {selectedChart.name}'s chart are highlighted
                </span>
              )}
            </div>
            
            {/* Chart Retrograde Planets Display - auto-detected from chart (major planets only) */}
            {selectedChart && retrogradePlanets.size > 0 && (() => {
              // Filter to only major planets, nodes, and Chiron
              const MAJOR_RETROGRADE_BODIES = [
                'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 
                'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node', 'Chiron'
              ];
              const filteredRetrogrades = Array.from(retrogradePlanets.entries())
                .filter(([planet]) => MAJOR_RETROGRADE_BODIES.includes(planet));
              
              if (filteredRetrogrades.length === 0) return null;
              
              return (
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="text-xs font-medium text-muted-foreground">Retrograde in chart:</span>
                    <div className="flex flex-wrap gap-2">
                      {filteredRetrogrades.map(([planet, data]) => (
                        <Badge 
                          key={planet} 
                          variant="secondary" 
                          className="text-xs bg-warning/20 text-warning"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          {getPlanetSymbol(planet)} {planet} ℞ in {SIGN_SYMBOLS[data.sign]} {data.sign}
                          {data.house && ` (${data.house}${data.house === 1 ? 'st' : data.house === 2 ? 'nd' : data.house === 3 ? 'rd' : 'th'} House)`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ℞ Retrograde planets express their energy more internally. Combos will show enhanced interpretations.
                  </p>
                </div>
              );
            })()}

            {/* Aspect Type Filter - only show when chart is selected */}
            {selectedChart && chartAspects.allAspectTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="text-xs font-medium text-muted-foreground">Filter by aspect:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedAspectFilter(null)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                        !selectedAspectFilter 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      All Aspects
                    </button>
                    {chartAspects.allAspectTypes.map(aspectType => {
                      const count = chartAspects.byType.get(aspectType)?.length || 0;
                      const aspectSymbol = aspectType === 'Conjunction' ? '☌' :
                                           aspectType === 'Sextile' ? '⚹' :
                                           aspectType === 'Square' ? '□' :
                                           aspectType === 'Trine' ? '△' :
                                           aspectType === 'Opposition' ? '☍' : '';
                      return (
                        <button
                          key={aspectType}
                          onClick={() => setSelectedAspectFilter(selectedAspectFilter === aspectType ? null : aspectType)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
                            selectedAspectFilter === aspectType 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <span>{aspectSymbol}</span>
                          {aspectType}
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-secondary/50">
                            {count}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selectedAspectFilter && chartAspects.byType.get(selectedAspectFilter) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">{selectedAspectFilter}s in chart: </span>
                    {chartAspects.byType.get(selectedAspectFilter)!.slice(0, 8).join(', ')}
                    {(chartAspects.byType.get(selectedAspectFilter)!.length > 8) && 
                      ` +${chartAspects.byType.get(selectedAspectFilter)!.length - 8} more`}
                  </div>
                )}
              </div>
            )}

            {/* Aspect Modifier Coverage Display */}
            {selectedChart && chartAspects.allPairs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Your {chartAspects.allPairs.length} Natal Aspects</span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30">
                    {aspectCoverage.withModifiers.length}/{chartAspects.allPairs.length} detailed
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground mb-3">
                  All <span className="font-medium">{chartAspects.allPairs.length}</span> major aspects in your chart are shown below.
                  <span className="font-medium text-primary"> {aspectCoverage.withModifiers.length}</span> have detailed writeups (✦),
                  <span className="font-medium"> {aspectCoverage.universal.length}</span> show core signatures only (○).
                </p>

                <p className="text-[11px] text-muted-foreground mb-3">
                  Glyph key: ☉ Sun, ☽ Moon, ☿ Mercury, ♀ Venus, ♂ Mars, ♃ Jupiter, ♄ Saturn, ♅ Uranus, ♆ Neptune, ♇ Pluto, AC Ascendant.
                  Aspect key: ☌ Conjunction, ⚹ Sextile, □ Square, △ Trine, ☍ Opposition.
                </p>
                
                {/* All aspects combined - with detailed first, then universal */}
                <div className="space-y-3">
                  {/* Detailed modifiers available */}
                  {aspectCoverage.withModifiers.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">
                        ✦ Detailed Writeups ({aspectCoverage.withModifiers.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aspectCoverage.withModifiers.map((pair, i) => {
                          const aspectSymbol = ASPECT_SYMBOLS[pair.aspect] || '';
                          return (
                            <Badge 
                              key={i} 
                              className="text-[10px] bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-default"
                            >
                              {getPlanetSymbol(pair.p1)} {aspectSymbol} {getPlanetSymbol(pair.p2)}
                              <span className="ml-1 opacity-70">{pair.modifierName}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Universal/core signature only */}
                  {aspectCoverage.universal.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wide">
                        ○ Core Signature Only ({aspectCoverage.universal.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aspectCoverage.universal.map((pair, i) => {
                          const aspectSymbol = ASPECT_SYMBOLS[pair.aspect] || '';
                          return (
                            <Badge 
                              key={i} 
                              variant="outline"
                              className="text-[10px] opacity-70 cursor-default"
                            >
                              {getPlanetSymbol(pair.p1)} {aspectSymbol} {getPlanetSymbol(pair.p2)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'explore' | 'browse' | 'patterns')}>
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Explore Combos
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Pattern Mirror
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-6 space-y-6">
          {/* Category Filter Chips */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Quick Filters
                </CardTitle>
                {(selectedFactors.length > 0 || selectedCategory) && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="h-8">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Chips */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50 hover:bg-secondary'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Active Selection Display */}
              {(selectedFactors.length > 0 || selectedCategory) && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  {selectedCategory && (
                    <Badge 
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(null)}
                    >
                      {CATEGORIES.find(c => c.id === selectedCategory)?.icon}{' '}
                      {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {selectedFactors.map((factor) => (
                    <Badge 
                      key={factor} 
                      className="cursor-pointer"
                      onClick={() => toggleFactor(factor)}
                    >
                      {PLANETS.includes(factor) ? getPlanetSymbol(factor) : SIGN_SYMBOLS[factor] || ''}{' '}
                      {factor}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Factor Selection */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Or Select Specific Factors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Planets with Retrograde Checkboxes */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Planets</h4>
                <div className="flex flex-wrap gap-3">
                  {PLANETS.map(planet => {
                    const isSelected = selectedFactors.includes(planet);
                    const isRetrograde = manualRetrogrades.has(planet) || retrogradePlanets.has(planet);
                    const isChartRetro = retrogradePlanets.has(planet);
                    
                    return (
                      <div key={planet} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => toggleFactor(planet)}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background border-border hover:border-primary/50 hover:bg-secondary'
                          }`}
                        >
                          <span className="mr-1">{getPlanetSymbol(planet)}</span>
                          {planet}
                          {isRetrograde && ' ℞'}
                        </button>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            id={`retro-${planet}`}
                            checked={isRetrograde}
                            disabled={isChartRetro} // Can't uncheck if it's from chart
                            onCheckedChange={(checked) => {
                              if (isChartRetro) return; // Don't allow unchecking chart retrogrades
                              setManualRetrogrades(prev => {
                                const next = new Set(prev);
                                if (checked) {
                                  next.add(planet);
                                } else {
                                  next.delete(planet);
                                }
                                return next;
                              });
                            }}
                            className="h-3 w-3"
                          />
                          <label 
                            htmlFor={`retro-${planet}`} 
                            className={`text-[10px] cursor-pointer ${isChartRetro ? 'text-warning' : 'text-muted-foreground'}`}
                          >
                            ℞
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signs */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Signs</h4>
                <div className="flex flex-wrap gap-2">
                  {SIGNS.map(sign => renderFactorButton(sign, SIGN_SYMBOLS[sign]))}
                </div>
              </div>

              {/* Houses */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Houses</h4>
                <div className="flex flex-wrap gap-2">
                  {HOUSES.map(house => renderFactorButton(house))}
                </div>
              </div>

              {/* Aspects */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Aspects</h4>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map(aspect => renderFactorButton(aspect))}
                </div>
              </div>

              {/* Points */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Points</h4>
                <div className="flex flex-wrap gap-2">
                  {POINTS.map(point => renderFactorButton(point))}
                </div>
              </div>

              {/* Transits */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Transits</h4>
                <div className="flex flex-wrap gap-2">
                  {transitPlanets.map(tp => {
                    const basePlanet = tp.replace(TRANSIT_PREFIX, '');
                    return renderFactorButton(tp, `T${getPlanetSymbol(basePlanet)}`);
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: combine Transit planet + sign/house + an aspect to describe timing (e.g. Transit ☿ + 12th House + Conjunction).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {(selectedFactors.length > 0 || selectedCategory || selectedChartId) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {matchingCombinations.length > 0 
                    ? selectedChartId && selectedFactors.length === 0 && !selectedCategory
                      ? `${matchingCombinations.length} Combination${matchingCombinations.length > 1 ? 's' : ''} in ${selectedChart?.name}'s Chart`
                      : `${matchingCombinations.length} Matching Combination${matchingCombinations.length > 1 ? 's' : ''}`
                    : 'No Exact Matches Found'
                  }
                </h3>
              </div>

              {matchingCombinations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {matchingCombinations.map(renderCombinationCard)}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No pre-written interpretation exists for this exact combination yet.
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      Try selecting different factors or fewer factors to find matches.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {selectedFactors.length === 0 && !selectedCategory && !selectedChartId && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Select a category filter or specific factors to discover planetary meanings
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Example: Click "💰 Wealth" or select Mercury + Taurus
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pattern Mirror Tab */}
        <TabsContent value="patterns" className="mt-6 space-y-6">
          {/* Explanation Card - What are Pattern Mirrors */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pattern Mirrors describe how configurations feel, not just what they mean.</p>
                  <p className="text-xs text-muted-foreground">
                    Unlike Combos (which describe single placements like "Mars in Aries"), Pattern Mirrors explore <strong>complex configurations</strong> — 
                    aspects between planets, specific house placements — and describe the <strong>lived experience</strong> with Light, Core, and Shadow expressions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Selector for Pattern Matching */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Check Patterns For:</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChartSelector
                    userNatalChart={userChart}
                    savedCharts={savedCharts}
                    selectedChartId={selectedChartId || ''}
                    onSelect={(id) => {
                      setSelectedChartId(id || null);
                      // Pattern Mirror is intentionally "your matches only" to avoid confusion.
                      setSelectedThematicTag('__MY_MATCHES__');
                    }}
                  />
                  {selectedChartId && (
                    <Badge variant="secondary" className="text-xs">
                      Showing your matches
                    </Badge>
                  )}
                </div>
              </div>
              {!selectedChartId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Select your chart to see your exact Pattern Mirror matches.
                </p>
              )}
            </CardHeader>
          </Card>


          {/* Pattern Mirror Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {patternMirrorCombos
                .map(combo => {
                  // Until a chart is actually resolved, don't render the library (avoids confusion).
                  if (!selectedChart) return null;

                  // Check if this pattern matches the selected chart
                  let isMatch = false;
                  let matchDetails: { aspectType?: string; sign?: string; house?: number } = {};

                if (selectedChart) {
                  // Check aspect patterns
                  if (combo.patternType === 'aspect' && combo.planets && combo.aspectTypes) {
                    const [p1, p2] = combo.planets;
                    const p1Pos = getChartPos(p1);
                    const p2Pos = getChartPos(p2);
                    if (p1Pos && p2Pos) {
                      const aspect = calculateAspect(p1Pos.sign, p1Pos.degree, p2Pos.sign, p2Pos.degree);
                      if (aspect && combo.aspectTypes.includes(aspect)) {
                        isMatch = true;
                        matchDetails.aspectType = aspect;
                      }
                    }
                  }

                  // Check house placement patterns
                  if (combo.patternType === 'house-placement' && combo.planets && combo.house) {
                    const planet = combo.planets[0];
                    const house = getNatalPlanetHouse(planet, selectedChart);
                    if (house === combo.house) {
                      isMatch = true;
                      matchDetails.house = house;
                    }
                    // NO partial match - having Moon in 12th is NOT relevant to a Moon in 4th pattern
                  }

                  // Check sign placement patterns
                  if (combo.patternType === 'sign-placement' && combo.planets && combo.signs) {
                    const planet = combo.planets[0];
                    const pos = getChartPos(planet);
                    if (pos && combo.signs.includes(pos.sign)) {
                      isMatch = true;
                      matchDetails.sign = pos.sign;
                    }
                  }

                  // Check combined patterns
                  if (combo.patternType === 'combined' && combo.planets) {
                    // Check aspects
                    if (combo.aspectTypes && combo.planets.length >= 2) {
                      const [p1, p2] = combo.planets;
                      const p1Pos = getChartPos(p1);
                      const p2Pos = getChartPos(p2);
                      if (p1Pos && p2Pos) {
                        const aspect = calculateAspect(p1Pos.sign, p1Pos.degree, p2Pos.sign, p2Pos.degree);
                        if (aspect && combo.aspectTypes.includes(aspect)) {
                          isMatch = true;
                          matchDetails.aspectType = aspect;
                        }
                      }
                    }
                    // Check signs
                    if (!isMatch && combo.signs) {
                      for (const planet of combo.planets) {
                        const pos = getChartPos(planet);
                        if (pos && combo.signs.includes(pos.sign)) {
                          isMatch = true;
                          matchDetails.sign = pos.sign;
                          break;
                        }
                      }
                    }
                    // Check house
                    if (!isMatch && combo.house) {
                      for (const planet of combo.planets) {
                        const house = getNatalPlanetHouse(planet, selectedChart);
                        if (house === combo.house) {
                          isMatch = true;
                          matchDetails.house = house;
                          break;
                        }
                      }
                    }
                  }
                }

                // Pattern Mirror is ALWAYS exact matches only once a chart is selected.
                if (selectedChart && !isMatch) {
                  return null;
                }

                return (
                  <div
                    key={combo.id}
                    id={`pattern-mirror-${combo.id}`}
                    className={`transition-all ${highlightedPatternId === combo.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg' : ''}`}
                    onAnimationEnd={() => {
                      // Clear highlight after animation
                      if (highlightedPatternId === combo.id) {
                        setTimeout(() => setHighlightedPatternId(null), 2000);
                      }
                    }}
                  >
                    <PatternMirrorCard
                      combo={combo}
                      isMatch={isMatch}
                      matchDetails={matchDetails}
                      onNavigateToCombo={(planets) => {
                        // Switch to Combos tab and pre-select these planets as factors
                        setActiveTab('explore');
                        setSelectedFactors(planets);
                        setSelectedCategory(null);
                      }}
                    />
                  </div>
                );
              })
              .filter(Boolean)}
          </div>

          {/* Empty state when your chart has no matches in the current library */}
          {selectedChart &&
            patternMirrorCombos.filter((combo) => {
              if (combo.patternType === 'aspect' && combo.planets && combo.aspectTypes) {
                const [p1, p2] = combo.planets;
                const p1Pos = getChartPos(p1);
                const p2Pos = getChartPos(p2);
                if (p1Pos && p2Pos) {
                  const aspect = calculateAspect(p1Pos.sign, p1Pos.degree, p2Pos.sign, p2Pos.degree);
                  return aspect && combo.aspectTypes.includes(aspect);
                }
              }
              if (combo.patternType === 'house-placement' && combo.planets && combo.house) {
                const house = getNatalPlanetHouse(combo.planets[0], selectedChart);
                return house === combo.house;
              }
              if (combo.patternType === 'sign-placement' && combo.planets && combo.signs) {
                const pos = getChartPos(combo.planets[0]);
                return !!pos && combo.signs.includes(pos.sign);
              }
              if (combo.patternType === 'combined' && combo.planets) {
                // same matching logic as above, but simplified for empty-state check
                if (combo.aspectTypes && combo.planets.length >= 2) {
                  const [p1, p2] = combo.planets;
                  const p1Pos = getChartPos(p1);
                  const p2Pos = getChartPos(p2);
                  if (p1Pos && p2Pos) {
                    const aspect = calculateAspect(p1Pos.sign, p1Pos.degree, p2Pos.sign, p2Pos.degree);
                    if (aspect && combo.aspectTypes.includes(aspect)) return true;
                  }
                }
                if (combo.signs) {
                  for (const p of combo.planets) {
                    const pos = getChartPos(p);
                    if (pos && combo.signs.includes(pos.sign)) return true;
                  }
                }
                if (combo.house) {
                  for (const p of combo.planets) {
                    const house = getNatalPlanetHouse(p, selectedChart);
                    if (house === combo.house) return true;
                  }
                }
              }
              return false;
            }).length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No pattern matches found for {selectedChart.name}'s chart in the current library.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <ScrollArea className="h-[70vh]">
            <div className="grid gap-4 md:grid-cols-2 pr-4">
              {allCombinations.map(renderCombinationCard)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CombosView;
