import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CombinationEntry 
} from '@/lib/planetaryCombinations';
import { Sun, Moon, X, Sparkles, AlertTriangle, Heart, Zap, BookOpen, Filter } from 'lucide-react';
import { getPlanetSymbol } from '@/components/PlanetSymbol';

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

interface CombosViewProps {
  className?: string;
}

export const CombosView = ({ className = '' }: CombosViewProps) => {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'browse'>('explore');

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => {
      if (prev.includes(factor)) {
        return prev.filter(f => f !== factor);
      }
      // Limit to 3 factors
      if (prev.length >= 3) {
        return [...prev.slice(1), factor];
      }
      return [...prev, factor];
    });
    // Clear category when selecting factors
    setSelectedCategory(null);
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
    return findCombinations(selectedFactors);
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

    return (
      <Card key={combo.id} className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
          Select up to 3 factors (planets, signs, houses) or filter by category to discover their combined meaning.
        </p>
      </div>

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
