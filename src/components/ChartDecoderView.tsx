import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Info } from 'lucide-react';

import { PlanetIconGrid } from './chartdecoder/PlanetIconGrid';
import { PlanetDetailCard } from './chartdecoder/PlanetDetailCard';
import { DignityTable } from './chartdecoder/DignityTable';
import { DispositorMap } from './chartdecoder/DispositorMap';

import { NatalChart } from '@/hooks/useNatalChart';
import {
  ChartPlanet,
  AspectOrbs,
  DEFAULT_ORBS,
  DEFAULT_CHART_DATA,
  computeDignity,
  computeAspects,
  computeDispositorChain,
  getAspectsForPlanet,
  generateSummaryNarrative
} from '@/lib/chartDecoderLogic';

interface ChartDecoderViewProps {
  natalChart: NatalChart | null;
  allCharts: NatalChart[];
  selectedChartId: string;
}

// Convert NatalChart to ChartPlanet[] format
const convertNatalChartToPlanets = (chart: NatalChart): ChartPlanet[] => {
  const planets: ChartPlanet[] = [];
  
  const planetNames = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Ascendant'
  ] as const;

  for (const name of planetNames) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (pos) {
      planets.push({
        name,
        sign: pos.sign,
        degree: pos.degree + (pos.minutes || 0) / 60,
        retrograde: pos.isRetrograde || false,
        house: null
      });
    }
  }

  // Add Midheaven from house cusps if available
  if (chart.houseCusps?.house10) {
    planets.push({
      name: 'Midheaven',
      sign: chart.houseCusps.house10.sign,
      degree: chart.houseCusps.house10.degree + (chart.houseCusps.house10.minutes || 0) / 60,
      retrograde: false,
      house: null
    });
  }

  return planets;
};

export const ChartDecoderView: React.FC<ChartDecoderViewProps> = ({
  natalChart,
  allCharts,
  selectedChartId
}) => {
  // Chart selection state
  const [localSelectedChart, setLocalSelectedChart] = useState<string>(
    selectedChartId === 'general' ? (natalChart?.id || allCharts[0]?.id || '') : selectedChartId
  );
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>('Sun');
  
  // Settings state
  const [useTraditional, setUseTraditional] = useState(true);
  const [aspectOrbs] = useState<AspectOrbs>(DEFAULT_ORBS);

  // Get the active chart
  const activeChart = useMemo(() => {
    if (localSelectedChart === 'user') return natalChart;
    return allCharts.find(c => c.id === localSelectedChart) || natalChart || allCharts[0];
  }, [localSelectedChart, natalChart, allCharts]);

  // Convert to ChartPlanet[] format
  const planets = useMemo(() => {
    if (!activeChart) return DEFAULT_CHART_DATA;
    return convertNatalChartToPlanets(activeChart);
  }, [activeChart]);

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

  if (!activeChart) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="text-muted-foreground mb-4" size={48} />
        <h2 className="text-xl font-serif mb-2">No Chart Available</h2>
        <p className="text-muted-foreground">
          Add a natal chart in the Charts tab to use the decoder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" size={24} />
          <div>
            <h2 className="text-2xl font-serif">Chart Decoder</h2>
            <p className="text-sm text-muted-foreground">
              Read your natal chart in plain English — dignities, aspects, and dispositors explained.
            </p>
          </div>
        </div>

        {/* Chart Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Decoding:
          </label>
          <select
            value={localSelectedChart}
            onChange={(e) => setLocalSelectedChart(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {allCharts.map(chart => (
              <option key={chart.id} value={chart.id}>{chart.name}</option>
            ))}
          </select>
          
          {/* Traditional Rulers Toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
            <input
              type="checkbox"
              checked={useTraditional}
              onChange={(e) => setUseTraditional(e.target.checked)}
              className="rounded border-border"
            />
            Traditional rulers
          </label>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Planet Grid */}
        <div className="lg:col-span-4 space-y-6">
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
