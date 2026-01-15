import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Info } from 'lucide-react';

import { ChartInputSection } from './chartdecoder/ChartInputSection';
import { PlanetIconGrid } from './chartdecoder/PlanetIconGrid';
import { PlanetDetailCard } from './chartdecoder/PlanetDetailCard';
import { DignityTable } from './chartdecoder/DignityTable';
import { DispositorMap } from './chartdecoder/DispositorMap';

import {
  ChartPlanet,
  ChartAspect,
  AspectOrbs,
  DEFAULT_ORBS,
  DEFAULT_CHART_DATA,
  computeDignity,
  computeAspects,
  computeDispositorChain,
  getAspectsForPlanet,
  generateSummaryNarrative
} from '@/lib/chartDecoderLogic';

export const ChartDecoderView: React.FC = () => {
  // Chart data state
  const [planets, setPlanets] = useState<ChartPlanet[]>(DEFAULT_CHART_DATA);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>('Sun');
  
  // Settings state
  const [houseSystem, setHouseSystem] = useState('auto_from_chart');
  const [useTraditional, setUseTraditional] = useState(true);
  const [aspectOrbs, setAspectOrbs] = useState<AspectOrbs>(DEFAULT_ORBS);

  // Computed values
  const aspects = useMemo(() => computeAspects(planets, aspectOrbs), [planets, aspectOrbs]);
  const summaryNarrative = useMemo(() => generateSummaryNarrative(planets), [planets]);

  // Get selected planet data
  const selectedPlanetData = useMemo(() => {
    if (!selectedPlanet) return null;
    const planet = planets.find(p => p.name === selectedPlanet);
    if (!planet) return null;

    const dignity = computeDignity(planet.name, planet.sign);
    const planetAspects = getAspectsForPlanet(planet.name, aspects);
    const dispositorChain = computeDispositorChain(planet, planets, useTraditional);

    return { planet, dignity, aspects: planetAspects, dispositorChain };
  }, [selectedPlanet, planets, aspects, useTraditional]);

  const handleChartDataLoaded = (newPlanets: ChartPlanet[]) => {
    setPlanets(newPlanets);
    // Select first planet if current selection not in new data
    if (!newPlanets.find(p => p.name === selectedPlanet)) {
      setSelectedPlanet(newPlanets[0]?.name || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary" size={24} />
        <div>
          <h2 className="text-2xl font-serif">Chart Decoder</h2>
          <p className="text-sm text-muted-foreground">
            Read your natal chart in plain English — dignities, aspects, and dispositors explained.
          </p>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Input & Planet Grid */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Section */}
          <ChartInputSection
            onChartDataLoaded={handleChartDataLoaded}
            houseSystem={houseSystem}
            setHouseSystem={setHouseSystem}
            useTraditional={useTraditional}
            setUseTraditional={setUseTraditional}
            aspectOrbs={aspectOrbs}
            setAspectOrbs={setAspectOrbs}
          />

          {/* Planet Picker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Tap a Planet
                <Info size={14} className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlanetIconGrid
                planets={planets}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Big Picture Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Chart in Simple Words</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {summaryNarrative.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Planet Detail Card */}
          {selectedPlanetData && (
            <PlanetDetailCard
              planet={selectedPlanetData.planet}
              dignity={selectedPlanetData.dignity}
              aspects={selectedPlanetData.aspects}
              dispositorChain={selectedPlanetData.dispositorChain}
              allPlanets={planets}
            />
          )}

          {/* Dispositor Map */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dispositor Map</CardTitle>
            </CardHeader>
            <CardContent>
              <DispositorMap
                planets={planets}
                useTraditional={useTraditional}
                onSelectPlanet={setSelectedPlanet}
              />
            </CardContent>
          </Card>

          {/* Dignity Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dignities at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <DignityTable
                planets={planets}
                onSelectPlanet={setSelectedPlanet}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
