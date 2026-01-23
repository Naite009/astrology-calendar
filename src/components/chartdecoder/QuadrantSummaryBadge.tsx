import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { analyzeQuadrants, getHemisphereSummary } from '@/lib/hemisphereAnalysis';
import { ChartPlanet } from '@/lib/chartDecoderLogic';

interface QuadrantSummaryBadgeProps {
  planets: ChartPlanet[];
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

export const QuadrantSummaryBadge: React.FC<QuadrantSummaryBadgeProps> = ({ planets }) => {
  const analysis = analyzeQuadrants(planets);
  const summaryLines = getHemisphereSummary(analysis);

  // Determine dominant orientation
  const isUpperDominant = analysis.hemispheres.upper.percentage > 55;
  const isLowerDominant = analysis.hemispheres.lower.percentage > 55;
  const isEasternDominant = analysis.hemispheres.eastern.percentage > 55;
  const isWesternDominant = analysis.hemispheres.western.percentage > 55;

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-4">
          {/* Visual Quadrant Mini-Chart */}
          <div className="shrink-0">
            <div className="grid grid-cols-2 gap-0.5 w-16 h-16 bg-muted/30 rounded-md overflow-hidden">
              {/* Q4: Houses 10-12 (top-left) */}
              <div 
                className={`flex items-center justify-center text-[10px] ${
                  analysis.q4.count >= 3 ? 'bg-primary/30 text-primary' : 'bg-muted/20 text-muted-foreground'
                }`}
                title={`Q4: ${analysis.q4.planets.join(', ') || 'Empty'}`}
              >
                {analysis.q4.count}
              </div>
              {/* Q3: Houses 7-9 (top-right) */}
              <div 
                className={`flex items-center justify-center text-[10px] ${
                  analysis.q3.count >= 3 ? 'bg-primary/30 text-primary' : 'bg-muted/20 text-muted-foreground'
                }`}
                title={`Q3: ${analysis.q3.planets.join(', ') || 'Empty'}`}
              >
                {analysis.q3.count}
              </div>
              {/* Q1: Houses 1-3 (bottom-left) */}
              <div 
                className={`flex items-center justify-center text-[10px] ${
                  analysis.q1.count >= 3 ? 'bg-primary/30 text-primary' : 'bg-muted/20 text-muted-foreground'
                }`}
                title={`Q1: ${analysis.q1.planets.join(', ') || 'Empty'}`}
              >
                {analysis.q1.count}
              </div>
              {/* Q2: Houses 4-6 (bottom-right) */}
              <div 
                className={`flex items-center justify-center text-[10px] ${
                  analysis.q2.count >= 3 ? 'bg-primary/30 text-primary' : 'bg-muted/20 text-muted-foreground'
                }`}
                title={`Q2: ${analysis.q2.planets.join(', ') || 'Empty'}`}
              >
                {analysis.q2.count}
              </div>
            </div>
          </div>

          {/* Summary Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-violet-500" />
              <span className="text-sm font-medium text-foreground">Life Focus Distribution</span>
            </div>

            {/* Hemisphere Badges */}
            <div className="flex flex-wrap gap-1.5">
              {isUpperDominant && (
                <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/30 flex items-center gap-1">
                  <ArrowUp size={10} />
                  {analysis.hemispheres.upper.percentage}% Public
                </Badge>
              )}
              {isLowerDominant && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1">
                  <ArrowDown size={10} />
                  {analysis.hemispheres.lower.percentage}% Private
                </Badge>
              )}
              {isEasternDominant && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                  <ArrowLeft size={10} />
                  {analysis.hemispheres.eastern.percentage}% Self-Starter
                </Badge>
              )}
              {isWesternDominant && (
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/30 flex items-center gap-1">
                  <ArrowRight size={10} />
                  {analysis.hemispheres.western.percentage}% Collaborative
                </Badge>
              )}
              {!isUpperDominant && !isLowerDominant && !isEasternDominant && !isWesternDominant && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  Balanced Distribution
                </Badge>
              )}
            </div>

            {/* Dominant Quadrant */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Dominant: </span>
              {analysis.dominantQuadrant}
            </div>
          </div>
        </div>

        {/* Quick Summary Lines */}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
          {summaryLines.map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              • {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuadrantSummaryBadge;
