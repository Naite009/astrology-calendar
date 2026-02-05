import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Zap, Moon, Check, Info } from 'lucide-react';
import { PatternMirrorCombo, THEMATIC_CATEGORIES } from '@/lib/patternMirrorCombos';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { ASPECT_SYMBOLS } from '@/lib/aspectModifiers';

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

interface PatternMirrorCardProps {
  combo: PatternMirrorCombo;
  isMatch?: boolean;
  matchDetails?: {
    aspectType?: string;
    sign?: string;
    house?: number;
  };
  // New: partial match info - what parts of the pattern the user HAS
  partialMatchInfo?: {
    hasHouse?: { planet: string; house: number };
    hasSign?: { planet: string; sign: string };
    missingPlanet?: string;
    missingAspect?: boolean;
  };
}

export const PatternMirrorCard = ({ combo, isMatch = false, matchDetails, partialMatchInfo }: PatternMirrorCardProps) => {
  // Build the pattern identifier display
  const getPatternIdentifier = () => {
    const parts: string[] = [];
    
    if (combo.planets) {
      parts.push(combo.planets.map(p => getPlanetSymbol(p)).join(' '));
    }
    
    if (combo.aspectTypes && combo.aspectTypes.length > 0) {
      // Show the matched aspect if available, otherwise show all
      if (matchDetails?.aspectType) {
        parts.push(ASPECT_SYMBOLS[matchDetails.aspectType] || matchDetails.aspectType);
      } else {
        parts.push(combo.aspectTypes.map(a => ASPECT_SYMBOLS[a] || a.charAt(0)).join('/'));
      }
    }
    
    if (combo.house) {
      parts.push(`${combo.house}${combo.house === 1 ? 'st' : combo.house === 2 ? 'nd' : combo.house === 3 ? 'rd' : 'th'} House`);
    }
    
    if (combo.signs) {
      const signDisplay = matchDetails?.sign 
        ? `${SIGN_SYMBOLS[matchDetails.sign]} ${matchDetails.sign}`
        : combo.signs.map(s => `${SIGN_SYMBOLS[s]} ${s}`).join(' / ');
      parts.push(signDisplay);
    }
    
    return parts.join(' • ');
  };

  // Get theme labels
  const getThemeLabels = () => {
    return combo.thematicTags.map(tag => {
      const category = THEMATIC_CATEGORIES.find(c => c.id === tag);
      return category ? { id: tag, label: category.label, icon: category.icon } : null;
    }).filter(Boolean);
  };

  // Build personalized explanation for full matches
  const getPersonalizedExplanation = (): string | null => {
    if (!isMatch) return null;

    if (matchDetails?.aspectType && combo.planets) {
      const [p1, p2] = combo.planets;
      return `Your ${p1} and ${p2} form a ${matchDetails.aspectType} in your natal chart. This means the themes of this pattern actively shape how you experience and express these energies.`;
    }

    if (matchDetails?.house && combo.planets) {
      const planet = combo.planets[0];
      const houseOrdinal = matchDetails.house === 1 ? '1st' : matchDetails.house === 2 ? '2nd' : matchDetails.house === 3 ? '3rd' : `${matchDetails.house}th`;
      return `Your ${planet} is placed in your ${houseOrdinal} house. This house placement directly activates the emotional patterns described here.`;
    }

    if (matchDetails?.sign && combo.planets) {
      const planet = combo.planets[0];
      return `Your ${planet} is in ${matchDetails.sign}. This sign placement colors how you experience and express these patterns.`;
    }

    return null;
  };

  // Build partial match explanation (when user has some but not all elements)
  const getPartialMatchExplanation = (): string | null => {
    if (isMatch || !partialMatchInfo) return null;

    const parts: string[] = [];

    if (partialMatchInfo.hasHouse) {
      const { planet, house } = partialMatchInfo.hasHouse;
      const houseOrdinal = house === 1 ? '1st' : house === 2 ? '2nd' : house === 3 ? '3rd' : `${house}th`;
      parts.push(`You have ${planet} in the ${houseOrdinal} house`);
    }

    if (partialMatchInfo.hasSign) {
      const { planet, sign } = partialMatchInfo.hasSign;
      parts.push(`${planet} in ${sign}`);
    }

    if (parts.length === 0) return null;

    let explanation = parts.join(', ') + '.';

    if (partialMatchInfo.missingPlanet) {
      explanation += ` You don't have ${partialMatchInfo.missingPlanet} in this position, so this isn't a full pattern match.`;
    } else if (partialMatchInfo.missingAspect) {
      explanation += ` These planets don't form the required aspect in your chart, so this is a partial resonance.`;
    }

    return explanation;
  };

  const personalizedExplanation = getPersonalizedExplanation();
  const partialExplanation = getPartialMatchExplanation();

  return (
    <Card className={`border-border transition-all ${isMatch ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {/* Match indicator & Pattern identifier */}
            <div className="flex items-center gap-2 flex-wrap">
              {isMatch && (
                <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                  <Check className="h-3 w-3" />
                  In Your Chart
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-mono">
                {getPatternIdentifier()}
              </Badge>
            </div>
            <CardTitle className="text-lg font-serif">{combo.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Personalized "In Your Chart" Explanation Box */}
        {personalizedExplanation && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary mb-1">Why This Applies to You</p>
                <p className="text-sm text-foreground/90">{personalizedExplanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Partial Match Explanation Box */}
        {partialExplanation && (
          <div className="p-3 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Partial Match in Your Chart</p>
                <p className="text-sm text-foreground/70">{partialExplanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary - the felt experience */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {combo.summary}
        </p>

        {/* Light / Core / Shadow Expressions */}
        <div className="space-y-4">
          {/* Light Expressions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <Sun className="h-3.5 w-3.5" />
              Light Expressions
            </h4>
            <ul className="space-y-1 pl-1">
              {combo.lightExpressions.map((expr, i) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {expr}
                </li>
              ))}
            </ul>
          </div>

          {/* Core Expressions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <Zap className="h-3.5 w-3.5" />
              Core Expressions
            </h4>
            <ul className="space-y-1 pl-1">
              {combo.coreExpressions.map((expr, i) => (
                <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  {expr}
                </li>
              ))}
            </ul>
          </div>

          {/* Shadow Expressions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-destructive/80 flex items-center gap-1.5 uppercase tracking-wide">
              <Moon className="h-3.5 w-3.5" />
              Shadow Expressions
            </h4>
            <ul className="space-y-1 pl-1">
              {combo.shadowExpressions.map((expr, i) => (
                <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                  <span className="text-destructive/70 mt-1">•</span>
                  {expr}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Thematic Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {getThemeLabels().map((theme) => (
            theme && (
              <Badge 
                key={theme.id} 
                variant="secondary" 
                className="text-[10px] px-2 py-0.5 bg-secondary/50"
              >
                {theme.icon} {theme.label}
              </Badge>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternMirrorCard;