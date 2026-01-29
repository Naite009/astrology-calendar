import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Sun, Moon, X, Sparkles, AlertTriangle, Heart, Zap, BookOpen, Filter, User, Check } from 'lucide-react';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { NatalChart } from '@/hooks/useNatalChart';

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
  const [activeTab, setActiveTab] = useState<'explore' | 'browse'>('explore');
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  // Combine all available charts
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userChart) charts.push(userChart);
    charts.push(...savedCharts);
    return charts;
  }, [userChart, savedCharts]);

  // Get the selected chart
  const selectedChart = useMemo(() => {
    if (!selectedChartId) return null;
    return allCharts.find(c => c.id === selectedChartId) || null;
  }, [selectedChartId, allCharts]);

  // Extract factors from the selected chart (planet-sign combinations)
  const chartFactors = useMemo(() => {
    if (!selectedChart?.planets) return new Set<string>();
    
    const factors = new Set<string>();
    const planetEntries = Object.entries(selectedChart.planets) as [string, { sign: string } | undefined][];
    
    for (const [planet, data] of planetEntries) {
      if (!data?.sign) continue;
      // Add planet-sign combo identifier
      factors.add(`${planet}|${data.sign}`);
      // Also track individual factors
      factors.add(planet);
      factors.add(data.sign);
    }
    
    return factors;
  }, [selectedChart]);

  // Check if a combination matches the selected chart
  const doesComboMatchChart = (combo: CombinationEntry): boolean => {
    if (!selectedChart || chartFactors.size === 0) return false;
    
    const comboPlanets = combo.factors.filter(f => PLANETS.includes(f));
    const comboSigns = combo.factors.filter(f => SIGNS.includes(f));
    
    // For planet-sign combos, check if the chart has that planet in that sign
    if (comboPlanets.length === 1 && comboSigns.length === 1) {
      return chartFactors.has(`${comboPlanets[0]}|${comboSigns[0]}`);
    }
    
    // For planet-only or multi-planet, check if all planets are present
    if (comboPlanets.length > 0 && comboSigns.length === 0) {
      return comboPlanets.every(p => chartFactors.has(p));
    }
    
    // For other combinations, check if all factors are present
    return combo.factors.every(f => chartFactors.has(f));
  };

  const TRANSIT_PREFIX = 'Transit ';
  const transitPlanets = useMemo(() => PLANETS.map(p => `${TRANSIT_PREFIX}${p}`), []);

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => {
      if (prev.includes(factor)) {
        return prev.filter(f => f !== factor);
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
  };

  const matchingCombinations = useMemo(() => {
    if (selectedCategory) {
      return findByCategory(selectedCategory);
    }
    if (selectedFactors.length === 0) return [];
    const normalized = selectedFactors.map(normalizeFactor);
    const results = findCombinations(normalized);
    if (results.length > 0) return results;

    const synth = synthesizeInterpretation(selectedFactors);
    return synth ? [synth] : [];
  }, [selectedFactors, selectedCategory]);

  const allCombinations = useMemo(() => getAllCombinations(), []);

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
                {combo.factors.map((factor, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {PLANETS.includes(factor) ? getPlanetSymbol(factor) : SIGN_SYMBOLS[factor] || ''}{' '}
                    {factor}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg font-serif">{combo.title}</CardTitle>
            </div>
            {combo.tags?.includes('warning') && (
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            )}
            {combo.tags?.includes('wealth') && (
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {combo.summary}
          </p>

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
              <Select 
                value={selectedChartId || ''} 
                onValueChange={(v) => setSelectedChartId(v || null)}
              >
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select a chart..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (show all)</SelectItem>
                  {allCharts.map(chart => (
                    <SelectItem key={chart.id} value={chart.id}>
                      {chart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChart && (
                <span className="text-xs text-muted-foreground">
                  Combinations in {selectedChart.name}'s chart are highlighted
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'explore' | 'browse')}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Explore Combos
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
              {/* Planets */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Planets</h4>
                <div className="flex flex-wrap gap-2">
                  {PLANETS.map(planet => renderFactorButton(planet, getPlanetSymbol(planet)))}
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
          {(selectedFactors.length > 0 || selectedCategory) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {matchingCombinations.length > 0 
                    ? `${matchingCombinations.length} Matching Combination${matchingCombinations.length > 1 ? 's' : ''}`
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
          {selectedFactors.length === 0 && !selectedCategory && (
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
