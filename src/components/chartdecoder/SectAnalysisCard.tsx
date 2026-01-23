import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Sparkles, Shield, Swords, Scale, Heart, Target } from 'lucide-react';
import { ChartStrengthsAnalysis } from '@/lib/chartStrengths';
import { PlanetaryCondition } from '@/lib/planetaryCondition';

interface SectAnalysisCardProps {
  analysis: ChartStrengthsAnalysis;
  conditions: PlanetaryCondition[];
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇'
};

export const SectAnalysisCard: React.FC<SectAnalysisCardProps> = ({ analysis, conditions }) => {
  const isNightChart = analysis.sectLight.planet === 'Moon';
  
  // Get Venus and Jupiter conditions
  const venusCondition = conditions.find(c => c.planet === 'Venus');
  const jupiterCondition = conditions.find(c => c.planet === 'Jupiter');
  const marsCondition = conditions.find(c => c.planet === 'Mars');
  const saturnCondition = conditions.find(c => c.planet === 'Saturn');

  // Sect benefic and malefic determination
  const sectBenefic = isNightChart ? 'Venus' : 'Jupiter';
  const outOfSectBenefic = isNightChart ? 'Jupiter' : 'Venus';
  const sectMalefic = isNightChart ? 'Mars' : 'Saturn';
  const outOfSectMalefic = isNightChart ? 'Saturn' : 'Mars';

  const getScoreColor = (score: number): string => {
    if (score >= 5) return 'text-emerald-600';
    if (score >= 2) return 'text-sky-600';
    if (score >= 0) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 5) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 2) return 'bg-sky-500/10 border-sky-500/30';
    if (score >= 0) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isNightChart ? <Moon size={16} className="text-violet-500" /> : <Sun size={16} className="text-amber-500" />}
            Sect Analysis: Your Planetary Teams
          </CardTitle>
          <Badge variant="outline" className={isNightChart ? 'bg-violet-500/10 text-violet-600 border-violet-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}>
            {isNightChart ? '☽ Night Chart' : '☉ Day Chart'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          In {isNightChart ? 'Night' : 'Day'} charts, {sectBenefic} is your primary helper and {sectMalefic} is easier to work with.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Benefics Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your Benefics (Helpers)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sect Benefic */}
            <div className={`p-3 rounded-lg border ${getScoreBg(isNightChart ? (venusCondition?.totalScore || 0) : (jupiterCondition?.totalScore || 0))}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PLANET_SYMBOLS[sectBenefic]}</span>
                  <div>
                    <div className="text-sm font-medium">{sectBenefic}</div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      Sect Benefic
                    </Badge>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(sectBenefic === 'Venus' ? (venusCondition?.totalScore || 0) : (jupiterCondition?.totalScore || 0))}`}>
                  {sectBenefic === 'Venus' 
                    ? (venusCondition?.totalScore || 0) > 0 ? '+' : ''
                    : (jupiterCondition?.totalScore || 0) > 0 ? '+' : ''}
                  {sectBenefic === 'Venus' ? venusCondition?.totalScore || 0 : jupiterCondition?.totalScore || 0}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {sectBenefic === 'Venus' 
                    ? 'Your primary source of love, beauty, and pleasure'
                    : 'Your primary source of luck, growth, and opportunity'
                  }
                </p>
                <p>
                  {sectBenefic === 'Venus' ? venusCondition?.sign : jupiterCondition?.sign} • 
                  House {sectBenefic === 'Venus' ? venusCondition?.house || '?' : jupiterCondition?.house || '?'}
                </p>
              </div>
            </div>

            {/* Out-of-Sect Benefic */}
            <div className={`p-3 rounded-lg border ${getScoreBg(isNightChart ? (jupiterCondition?.totalScore || 0) : (venusCondition?.totalScore || 0))}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PLANET_SYMBOLS[outOfSectBenefic]}</span>
                  <div>
                    <div className="text-sm font-medium">{outOfSectBenefic}</div>
                    <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                      Out of Sect
                    </Badge>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(outOfSectBenefic === 'Venus' ? (venusCondition?.totalScore || 0) : (jupiterCondition?.totalScore || 0))}`}>
                  {outOfSectBenefic === 'Venus' 
                    ? (venusCondition?.totalScore || 0) > 0 ? '+' : ''
                    : (jupiterCondition?.totalScore || 0) > 0 ? '+' : ''}
                  {outOfSectBenefic === 'Venus' ? venusCondition?.totalScore || 0 : jupiterCondition?.totalScore || 0}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {outOfSectBenefic === 'Venus' 
                    ? 'Love and beauty available with effort'
                    : 'Growth and luck through conscious work'
                  }
                </p>
                <p>
                  {outOfSectBenefic === 'Venus' ? venusCondition?.sign : jupiterCondition?.sign} • 
                  House {outOfSectBenefic === 'Venus' ? venusCondition?.house || '?' : jupiterCondition?.house || '?'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Malefics Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-amber-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your Malefics (Disciplinarians)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sect Malefic */}
            <div className={`p-3 rounded-lg border ${getScoreBg(isNightChart ? (marsCondition?.totalScore || 0) : (saturnCondition?.totalScore || 0))}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PLANET_SYMBOLS[sectMalefic]}</span>
                  <div>
                    <div className="text-sm font-medium">{sectMalefic}</div>
                    <Badge variant="outline" className="text-[10px] bg-violet-500/20 text-violet-600 border-violet-500/30">
                      Sect Malefic
                    </Badge>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(sectMalefic === 'Mars' ? (marsCondition?.totalScore || 0) : (saturnCondition?.totalScore || 0))}`}>
                  {sectMalefic === 'Mars' 
                    ? (marsCondition?.totalScore || 0) > 0 ? '+' : ''
                    : (saturnCondition?.totalScore || 0) > 0 ? '+' : ''}
                  {sectMalefic === 'Mars' ? marsCondition?.totalScore || 0 : saturnCondition?.totalScore || 0}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {sectMalefic === 'Mars' 
                    ? 'Your drive and courage—easier to manage'
                    : 'Your discipline and structure—easier to embrace'
                  }
                </p>
                <p>
                  {sectMalefic === 'Mars' ? marsCondition?.sign : saturnCondition?.sign} • 
                  House {sectMalefic === 'Mars' ? marsCondition?.house || '?' : saturnCondition?.house || '?'}
                </p>
              </div>
            </div>

            {/* Out-of-Sect Malefic */}
            <div className={`p-3 rounded-lg border ${getScoreBg(isNightChart ? (saturnCondition?.totalScore || 0) : (marsCondition?.totalScore || 0))}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PLANET_SYMBOLS[outOfSectMalefic]}</span>
                  <div>
                    <div className="text-sm font-medium">{outOfSectMalefic}</div>
                    <Badge variant="outline" className="text-[10px] bg-rose-500/20 text-rose-600 border-rose-500/30">
                      Out of Sect
                    </Badge>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(outOfSectMalefic === 'Mars' ? (marsCondition?.totalScore || 0) : (saturnCondition?.totalScore || 0))}`}>
                  {outOfSectMalefic === 'Mars' 
                    ? (marsCondition?.totalScore || 0) > 0 ? '+' : ''
                    : (saturnCondition?.totalScore || 0) > 0 ? '+' : ''}
                  {outOfSectMalefic === 'Mars' ? marsCondition?.totalScore || 0 : saturnCondition?.totalScore || 0}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">
                  {outOfSectMalefic === 'Mars' 
                    ? 'Requires conscious channeling—watch impulsiveness'
                    : 'May feel heavier—work with limitations consciously'
                  }
                </p>
                <p>
                  {outOfSectMalefic === 'Mars' ? marsCondition?.sign : saturnCondition?.sign} • 
                  House {outOfSectMalefic === 'Mars' ? marsCondition?.house || '?' : saturnCondition?.house || '?'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Key Insight: </span>
            {isNightChart 
              ? `As a Night chart native, Venus and Mars work more smoothly for you. Jupiter's luck comes through inner work, and Saturn's challenges may feel heavier. Trust your instincts and emotional intelligence.`
              : `As a Day chart native, Jupiter and Saturn work more smoothly for you. Venus's pleasures come through conscious appreciation, and Mars's fire may run hotter. Trust your visible actions and conscious will.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectAnalysisCard;
