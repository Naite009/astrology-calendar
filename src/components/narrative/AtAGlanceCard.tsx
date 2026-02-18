import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NatalChart } from '@/hooks/useNatalChart';
import { SignalsData } from '@/lib/narrativeAnalysisEngine';
import { Star, Diamond } from 'lucide-react';
import type { ReadingType } from '../GroundedNarrativeView';

interface Props {
  readingType: ReadingType;
  chart?: NatalChart | null;
  signals?: SignalsData | null;
  hdChart?: any;
}

export function AtAGlanceCard({ readingType, chart, signals, hdChart }: Props) {
  const showAstro = readingType === 'astrology' || readingType === 'combined';
  const showHd = readingType === 'human_design' || readingType === 'combined';

  const sun = chart?.planets?.Sun;
  const moon = chart?.planets?.Moon;
  const asc = chart?.houseCusps?.house1 || chart?.planets?.Ascendant;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4 px-5">
        <div className={`grid gap-4 ${readingType === 'combined' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Astrology side */}
          {showAstro && chart && (
            <div className="space-y-2">
              {readingType === 'combined' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Astrology</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {sun && (
                  <Badge variant="outline" className="text-xs font-normal">
                    ☉ {sun.sign}
                  </Badge>
                )}
                {moon && (
                  <Badge variant="outline" className="text-xs font-normal">
                    ☽ {moon.sign}
                  </Badge>
                )}
                {asc && (
                  <Badge variant="outline" className="text-xs font-normal">
                    ASC {(asc as any).sign}
                  </Badge>
                )}
                {signals?.dominantElement && (
                  <Badge variant="secondary" className="text-[10px]">
                    {signals.dominantElement} dominant
                  </Badge>
                )}
                {signals && signals.angularPlanets.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {signals.angularPlanets.length} angular planet{signals.angularPlanets.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* HD side */}
          {showHd && hdChart && (
            <div className="space-y-2">
              {readingType === 'combined' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Diamond className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Human Design</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {hdChart.type && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {hdChart.type}
                  </Badge>
                )}
                {hdChart.authority && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {hdChart.authority}
                  </Badge>
                )}
                {hdChart.profile && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {hdChart.profile}
                  </Badge>
                )}
                {hdChart.definitionType && (
                  <Badge variant="secondary" className="text-[10px]">
                    {hdChart.definitionType} Def.
                  </Badge>
                )}
                {hdChart.incarnationCross?.name && (
                  <Badge variant="secondary" className="text-[10px]">
                    {hdChart.incarnationCross.name}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
