import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChartPlanet,
  ChartAspect,
  DispositorChainResult,
  DignityType,
  getPlanetSymbol,
  getSignSymbol,
  getAspectSymbol,
  getAspectNature,
  getAspectMeaning,
  PLANET_MEANINGS,
  DIGNITY_EXPLAINERS,
  generatePlainEnglish,
  generateRemedies,
  generateDispositorExperience
} from '@/lib/chartDecoderLogic';
import { getDignityStatus } from '@/lib/planetDignities';

interface PlanetDetailCardProps {
  planet: ChartPlanet;
  dignity: DignityType;
  aspects: ChartAspect[];
  dispositorChain: DispositorChainResult;
  allPlanets: ChartPlanet[];
}

export const PlanetDetailCard: React.FC<PlanetDetailCardProps> = ({
  planet,
  dignity,
  aspects,
  dispositorChain,
  allPlanets
}) => {
  const status = getDignityStatus(planet.name, planet.sign);
  const meaning = PLANET_MEANINGS[planet.name] || 'Symbolic point in the chart.';
  const dignityExplainer = DIGNITY_EXPLAINERS[dignity];
  const plainEnglish = generatePlainEnglish(planet, dignity);
  const remedies = generateRemedies(planet, dignity);

  const getOtherPlanet = (aspect: ChartAspect): ChartPlanet | undefined => {
    const otherName = aspect.planet1 === planet.name ? aspect.planet2 : aspect.planet1;
    return allPlanets.find(p => p.name === otherName);
  };

  return (
    <Card className="border-2" style={{ borderColor: status.color }}>
      <CardHeader className="pb-3" style={{ backgroundColor: status.bgColor }}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl" style={{ color: status.color }}>
              {getPlanetSymbol(planet.name)}
            </span>
            <div>
              <h2 className="text-xl font-serif">{planet.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                in {getSignSymbol(planet.sign)} {planet.sign} at {planet.degree.toFixed(1)}°
                {planet.retrograde && <span className="ml-1 text-amber-500">℞ Retrograde</span>}
                {planet.house && <span className="ml-1">• House {planet.house}</span>}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline"
            className="text-sm"
            style={{ borderColor: status.color, color: status.color }}
          >
            {status.type}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* What this planet represents */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            What {planet.name} Represents
          </h3>
          <p className="text-foreground">{meaning}</p>
        </section>

        <Separator />

        {/* Dignity explanation */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Dignity — How Supported It Is
          </h3>
          <div 
            className="p-3 rounded-md text-sm"
            style={{ backgroundColor: status.bgColor }}
          >
            <p className="font-medium" style={{ color: status.color }}>
              {planet.name} in {planet.sign} is in {dignity}
            </p>
            <p className="text-muted-foreground mt-1">{dignityExplainer}</p>
          </div>
        </section>

        <Separator />

        {/* Plain English */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            In Plain English
          </h3>
          <ul className="space-y-2">
            {plainEnglish.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        {/* Key Aspects */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Key Aspects to {planet.name}
          </h3>
          {aspects.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              <p>No major aspects found within standard orbs.</p>
              <p className="text-xs mt-1 italic">
                Note: This uses the chart data provided. If you expect aspects, check the degree positions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aspects.slice(0, 6).map((aspect, i) => {
                const other = getOtherPlanet(aspect);
                const nature = getAspectNature(aspect.aspectType);
                const aspectMeaning = getAspectMeaning(planet.name, other?.name || '', aspect.aspectType);
                
                // Determine aspect strength
                const isTight = aspect.orb < 3;
                const isWide = aspect.orb > 5;
                const strengthLabel = isTight ? 'EXACT' : isWide ? 'WIDE' : null;
                const strengthColor = isTight ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground bg-muted/30';
                
                return (
                  <div 
                    key={i}
                    className={`p-3 rounded ${
                      nature === 'flowing' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : nature === 'challenging' 
                          ? 'bg-rose-500/10 border border-rose-500/20' 
                          : 'bg-secondary/50 border border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getAspectSymbol(aspect.aspectType)}</span>
                        <span className="font-medium text-sm">
                          {aspect.aspectType.charAt(0).toUpperCase() + aspect.aspectType.slice(1)}
                        </span>
                        {other && (
                          <span className="text-muted-foreground text-sm">
                            to {getPlanetSymbol(other.name)} {other.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {strengthLabel && (
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${strengthColor}`}>
                            {strengthLabel}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {aspect.orb.toFixed(1)}°
                        </span>
                      </div>
                    </div>
                    {aspectMeaning && (
                      <p className="text-xs text-muted-foreground mt-1">{aspectMeaning}</p>
                    )}
                    {isTight && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                        ✦ This is a tight aspect — you feel it strongly and consistently.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Separator />

        {/* Dispositor Chain */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Dispositor Chain — Who It Reports To
          </h3>
          <div className="bg-secondary/30 p-3 rounded-md">
            <p className="text-sm font-mono mb-2">
              {dispositorChain.chain.join(' ')}
            </p>
            <p className="text-sm font-medium text-primary">
              Final: {dispositorChain.finalDispositor}
            </p>
            {dispositorChain.notes.map((note, i) => (
              <p key={i} className="text-xs text-muted-foreground mt-1">{note}</p>
            ))}
          </div>
          
          {/* Experiential explanation */}
          <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/20">
            <h4 className="text-xs font-medium text-primary mb-2">💡 How You Feel This</h4>
            <ul className="space-y-2">
              {generateDispositorExperience(planet, dispositorChain, allPlanets).map((exp, i) => (
                <li key={i} className="text-xs text-muted-foreground">{exp}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground mt-2 italic">
            A dispositor is the planet that rules the sign a planet is in. Following the chain reveals who calls the shots.
          </p>
        </section>

        <Separator />

        {/* Practical Support */}
        <section>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            What Helps — Practical Support
          </h3>
          <ul className="space-y-2">
            {remedies.map((remedy, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{remedy}</span>
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
};
