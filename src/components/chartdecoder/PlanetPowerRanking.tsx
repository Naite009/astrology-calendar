import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Eye } from 'lucide-react';
import { PlanetaryCondition } from '@/lib/planetaryCondition';
import { ChartAspect } from '@/lib/chartDecoderLogic';
import { PlanetSpotlightModal } from './PlanetSpotlightModal';

interface PlanetPowerRankingProps {
  conditions: PlanetaryCondition[];
  aspects?: ChartAspect[];
  houseCusps?: Record<number, { sign: string; degree: number }>;
  onSelectPlanet?: (planet: string) => void;
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

const getBarColor = (score: number): string => {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 5) return 'bg-green-500';
  if (score >= 2) return 'bg-sky-500';
  if (score >= 0) return 'bg-amber-500';
  return 'bg-rose-500';
};

const getTextColor = (score: number): string => {
  if (score >= 8) return 'text-emerald-600';
  if (score >= 5) return 'text-green-600';
  if (score >= 2) return 'text-sky-600';
  if (score >= 0) return 'text-amber-600';
  return 'text-rose-600';
};

export const PlanetPowerRanking: React.FC<PlanetPowerRankingProps> = ({ 
  conditions,
  aspects = [],
  houseCusps,
  onSelectPlanet 
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryCondition | null>(null);
  // Find min and max scores for scaling
  const scores = conditions.map(c => c.totalScore);
  const maxScore = Math.max(...scores, 10);
  const minScore = Math.min(...scores, -5);
  const range = maxScore - minScore;

  // Calculate bar width percentage (0-100)
  const getBarWidth = (score: number): number => {
    if (range === 0) return 50;
    return Math.max(5, ((score - minScore) / range) * 100);
  };

  // Categorize planets
  const allies = conditions.filter(c => c.totalScore >= 5);
  const workers = conditions.filter(c => c.totalScore >= 2 && c.totalScore < 5);
  const edges = conditions.filter(c => c.totalScore < 2);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Planetary Power Ranking
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {allies.length} Allies
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              {workers.length} Workers
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              {edges.length} Edges
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Eye size={12} /> Tap any planet for detailed spotlight
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {conditions.map((condition, index) => (
          <div
            key={condition.planet}
            className="group flex items-center gap-3 p-2 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedPlanet(condition);
              onSelectPlanet?.(condition.planet);
            }}
          >
            {/* Rank Number */}
            <div className="w-5 text-xs text-muted-foreground text-center">
              #{index + 1}
            </div>

            {/* Planet Symbol + Name */}
            <div className="flex items-center gap-2 w-24">
              <span className="text-lg">{PLANET_SYMBOLS[condition.planet] || '⚫'}</span>
              <span className="text-sm font-medium truncate">{condition.planet}</span>
            </div>

            {/* Bar Visualization */}
            <div className="flex-1 relative">
              <div className="h-5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(condition.totalScore)} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${getBarWidth(condition.totalScore)}%` }}
                />
              </div>
              {/* Sign label inside bar area */}
              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-[10px] text-muted-foreground/70">
                  {condition.sign}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className={`w-10 text-right text-sm font-medium ${getTextColor(condition.totalScore)}`}>
              {condition.totalScore > 0 ? '+' : ''}{condition.totalScore}
            </div>

            {/* Quality Badge */}
            <Badge 
              variant="outline"
              className={`text-[10px] w-16 justify-center ${
                condition.qualityRating === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                condition.qualityRating === 'Good' ? 'bg-green-500/10 text-green-600 border-green-500/30' :
                condition.qualityRating === 'Moderate' ? 'bg-sky-500/10 text-sky-600 border-sky-500/30' :
                condition.qualityRating === 'Challenged' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}
            >
              {condition.qualityRating}
            </Badge>
          </div>
        ))}

        {/* Team Summary */}
        <div className="pt-4 border-t border-border/50 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Planetary Team
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Allies */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
              <div className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">
                Allies (Score 5+)
              </div>
              <div className="flex flex-wrap gap-1">
                {allies.length > 0 ? allies.map(c => (
                  <span key={c.planet} className="text-sm">
                    {PLANET_SYMBOLS[c.planet]}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <p className="text-[10px] text-emerald-600/70 mt-1">
                Reliable inner resources
              </p>
            </div>

            {/* Workers */}
            <div className="p-3 bg-sky-500/5 border border-sky-500/20 rounded-md">
              <div className="text-[10px] uppercase tracking-wider text-sky-600 mb-1">
                Workers (Score 2-4)
              </div>
              <div className="flex flex-wrap gap-1">
                {workers.length > 0 ? workers.map(c => (
                  <span key={c.planet} className="text-sm">
                    {PLANET_SYMBOLS[c.planet]}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <p className="text-[10px] text-sky-600/70 mt-1">
                Available with effort
              </p>
            </div>

            {/* Growth Edges */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
              <div className="text-[10px] uppercase tracking-wider text-amber-600 mb-1">
                Growth Edges (Below 2)
              </div>
              <div className="flex flex-wrap gap-1">
                {edges.length > 0 ? edges.map(c => (
                  <span key={c.planet} className="text-sm">
                    {PLANET_SYMBOLS[c.planet]}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <p className="text-[10px] text-amber-600/70 mt-1">
                Wisdom through work
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Planet Spotlight Modal */}
      <PlanetSpotlightModal
        isOpen={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        condition={selectedPlanet}
        aspects={aspects}
        houseCusps={houseCusps}
      />
    </Card>
  );
};

export default PlanetPowerRanking;
