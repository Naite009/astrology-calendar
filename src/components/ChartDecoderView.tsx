import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Info, Users, Heart, Grid3X3, Star } from 'lucide-react';

import { PlanetIconGrid } from './chartdecoder/PlanetIconGrid';
import { PlanetDetailCard } from './chartdecoder/PlanetDetailCard';
import { DignityTable } from './chartdecoder/DignityTable';
import { DispositorMap } from './chartdecoder/DispositorMap';
import { ReadingScriptGenerator } from './chartdecoder/ReadingScriptGenerator';
import { BirthConditionsDisplay } from './chartdecoder/BirthConditionsDisplay';
import { ChartCastOverview } from './chartdecoder/ChartCastOverview';
import { QuadrantAnalysisDisplay } from './chartdecoder/QuadrantAnalysisDisplay';
import { HighestPotentialSynthesis } from './chartdecoder/HighestPotentialSynthesis';

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

// Helper to convert sign + degree to absolute zodiac degree (0-359)
const toAbsoluteDegree = (sign: string, degree: number): number => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
};

// Calculate which house a planet is in based on house cusps
const calculateHouse = (
  planetSign: string, 
  planetDegree: number, 
  houseCusps: NatalChart['houseCusps']
): number | null => {
  if (!houseCusps) return null;
  
  const planetAbsDeg = toAbsoluteDegree(planetSign, planetDegree);
  
  // Build array of house cusp degrees
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      cusps.push(toAbsoluteDegree(cusp.sign, cusp.degree + (cusp.minutes || 0) / 60));
    } else {
      return null; // Missing house cusp data
    }
  }
  
  // Find which house the planet is in
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    
    // Handle wrap-around at 0°/360°
    if (nextCusp < currentCusp) {
      // Cusp crosses 0° Aries
      if (planetAbsDeg >= currentCusp || planetAbsDeg < nextCusp) {
        return i + 1;
      }
    } else {
      if (planetAbsDeg >= currentCusp && planetAbsDeg < nextCusp) {
        return i + 1;
      }
    }
  }
  
  return 1; // Default to 1st house if calculation fails
};

// Convert NatalChart to ChartPlanet[] format
const convertNatalChartToPlanets = (chart: NatalChart): ChartPlanet[] => {
  const planets: ChartPlanet[] = [];
  
  const planetNames = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode'
  ] as const;

  for (const name of planetNames) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (pos) {
      const degree = pos.degree + (pos.minutes || 0) / 60;
      const house = calculateHouse(pos.sign, degree, chart.houseCusps);
      
      planets.push({
        name,
        sign: pos.sign,
        degree,
        retrograde: pos.isRetrograde || false,
        house
      });
    }
  }

  // Add Ascendant - prefer houseCusps.house1 (more reliable), then fall back to planets.Ascendant
  const ascendantSource = chart.houseCusps?.house1 || chart.planets.Ascendant;
  if (ascendantSource) {
    planets.push({
      name: 'Ascendant',
      sign: ascendantSource.sign,
      degree: ascendantSource.degree + (ascendantSource.minutes || 0) / 60,
      retrograde: false,
      house: 1  // Ascendant is always 1st house cusp
    });
  }

  // Add Midheaven from house cusps if available
  if (chart.houseCusps?.house10) {
    planets.push({
      name: 'Midheaven',
      sign: chart.houseCusps.house10.sign,
      degree: chart.houseCusps.house10.degree + (chart.houseCusps.house10.minutes || 0) / 60,
      retrograde: false,
      house: 10  // Midheaven is always 10th house cusp
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
  const [activeTab, setActiveTab] = useState<string>('overview');
  
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
  const summaryNarrative = useMemo(() => generateSummaryNarrative(planets, useTraditional), [planets, useTraditional]);

  // Get selected planet data
  const selectedPlanetData = useMemo(() => {
    if (!selectedPlanet) return null;
    const planet = planets.find(p => p.name === selectedPlanet);
    if (!planet) return null;

    const dignity = computeDignity(planet.name, planet.sign, useTraditional);
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
            <h2 className="text-2xl font-serif">Story of Self</h2>
            <p className="text-sm text-muted-foreground">
              Your cinematic chart interpretation — discover your cast of characters
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

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 py-2.5">
            <Sparkles size={14} />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-1.5 py-2.5">
            <Users size={14} />
            <span className="hidden sm:inline">Characters</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-1.5 py-2.5">
            <Heart size={14} />
            <span className="hidden sm:inline">Relationships</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-1.5 py-2.5">
            <Grid3X3 size={14} />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="synthesis" className="flex items-center gap-1.5 py-2.5">
            <Star size={14} />
            <span className="hidden sm:inline">Synthesis</span>
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Birth Conditions */}
          <BirthConditionsDisplay chart={activeChart} />
          
          {/* Cast Overview */}
          <ChartCastOverview 
            planets={planets}
            onSelectPlanet={(name) => {
              setSelectedPlanet(name);
              setActiveTab('characters');
            }}
            selectedPlanet={selectedPlanet}
            useTraditional={useTraditional}
          />
          
          {/* Quick Summary */}
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
        </TabsContent>

        {/* CHARACTERS TAB */}
        <TabsContent value="characters" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Planet Grid */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    Tap a Character
                    <Info size={14} className="text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlanetIconGrid
                    planets={planets}
                    selectedPlanet={selectedPlanet}
                    onSelectPlanet={setSelectedPlanet}
                    useTraditional={useTraditional}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Details */}
            <div className="lg:col-span-8 space-y-6">
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

              {/* Dignity Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dignities at a Glance</CardTitle>
                </CardHeader>
                <CardContent>
                  <DignityTable
                    planets={planets}
                    onSelectPlanet={setSelectedPlanet}
                    useTraditional={useTraditional}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* RELATIONSHIPS TAB */}
        <TabsContent value="relationships" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispositor Map */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dispositor Map — Who Reports to Whom</CardTitle>
              </CardHeader>
              <CardContent>
                <DispositorMap
                  planets={planets}
                  useTraditional={useTraditional}
                  onSelectPlanet={setSelectedPlanet}
                />
              </CardContent>
            </Card>

            {/* Aspect Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cast Chemistry — Aspects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs text-emerald-500 font-medium mb-2">Allies (Flowing)</h4>
                    <div className="flex flex-wrap gap-2">
                      {aspects.filter(a => ['trine', 'sextile'].includes(a.aspectType)).slice(0, 8).map((a, i) => (
                        <span key={i} className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded">
                          {a.planet1} {a.aspectType === 'trine' ? '△' : '✱'} {a.planet2}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-amber-500 font-medium mb-2">Rivals (Productive Tension)</h4>
                    <div className="flex flex-wrap gap-2">
                      {aspects.filter(a => ['square', 'opposition'].includes(a.aspectType)).slice(0, 8).map((a, i) => (
                        <span key={i} className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded">
                          {a.planet1} {a.aspectType === 'square' ? '□' : '☍'} {a.planet2}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs text-primary font-medium mb-2">Merged (Conjunctions)</h4>
                    <div className="flex flex-wrap gap-2">
                      {aspects.filter(a => a.aspectType === 'conjunction').slice(0, 6).map((a, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {a.planet1} ☌ {a.planet2}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reading Script Generator */}
          <ReadingScriptGenerator
            planets={planets}
            aspects={aspects}
            chartName={activeChart?.name || 'This Chart'}
            useTraditional={useTraditional}
            natalChart={activeChart}
          />
        </TabsContent>

        {/* PATTERNS TAB */}
        <TabsContent value="patterns" className="mt-6">
          <QuadrantAnalysisDisplay planets={planets} />
        </TabsContent>

        {/* SYNTHESIS TAB */}
        <TabsContent value="synthesis" className="mt-6">
          <HighestPotentialSynthesis
            chart={activeChart}
            planets={planets}
            aspects={aspects}
            useTraditional={useTraditional}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
