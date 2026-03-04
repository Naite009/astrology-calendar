import { useState, useMemo } from 'react';
import { ZodiacSignExplorer } from '@/components/narrative/ZodiacSignExplorer';
import { PlanetEncyclopediaExplorer } from '@/components/narrative/PlanetEncyclopediaExplorer';
import { HouseEncyclopediaExplorer } from '@/components/narrative/HouseEncyclopediaExplorer';
import { AspectEncyclopediaExplorer } from '@/components/narrative/AspectEncyclopediaExplorer';
import { EclipseEncyclopediaExplorer } from '@/components/narrative/EclipseEncyclopediaExplorer';
import { MidpointExplorer } from '@/components/narrative/MidpointExplorer';
import { ElementDistributionCard } from '@/components/narrative/ElementDistributionCard';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { computeAllSignals } from '@/lib/narrativeAnalysisEngine';
import { buildLiveSkyChart } from '@/lib/liveSkyChart';

type SubTab = 'signs' | 'planets' | 'houses' | 'aspects' | 'midpoints' | 'eclipses';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  onNavigateToView?: (view: string) => void;
}

export function FoundationsView({ userNatalChart, savedCharts, onNavigateToView }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>('signs');
  // Default to 'user' so the dropdown reflects the user's chart is selected
  const [selectedChartId, setSelectedChartId] = useState<string | null>(
    userNatalChart ? 'user' : null
  );

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    const seenNames = new Set<string>();
    if (userNatalChart) {
      charts.push(userNatalChart);
      seenNames.add((userNatalChart.name || '').toLowerCase().trim());
    }
    savedCharts.forEach(c => {
      if ((c as any).solarReturnYear) return; // skip solar returns
      if (c.id.startsWith('hd_')) return; // skip HD-only
      const norm = (c.name || '').toLowerCase().trim();
      if (seenNames.has(norm)) return;
      seenNames.add(norm);
      charts.push(c);
    });
    return charts;
  }, [userNatalChart, savedCharts]);

  // For houses tab: default to live sky when no chart explicitly selected
  const liveSkyChart = useMemo(() => buildLiveSkyChart(), []);

  const selectedChart = useMemo(() => {
    if (selectedChartId === '__live_sky__') return liveSkyChart;
    if (selectedChartId === 'user') return userNatalChart || allCharts[0] || null;
    if (selectedChartId) return allCharts.find(c => c.id === selectedChartId || c.name === selectedChartId) || allCharts[0] || null;
    // Default behavior: houses tab defaults to live sky, others default to first chart
    if (activeTab === 'houses') return liveSkyChart;
    return allCharts[0] || null;
  }, [selectedChartId, allCharts, activeTab, liveSkyChart, userNatalChart]);

  const planetHouses = useMemo(() => {
    if (!selectedChart || !selectedChart.planets || Object.keys(selectedChart.planets).length < 3) return [];
    return computeAllSignals(selectedChart).planetHouses;
  }, [selectedChart]);

  const tabs: { key: SubTab; label: string; icon: string }[] = [
    { key: 'signs', label: 'Signs', icon: '♈' },
    { key: 'planets', label: 'Planets', icon: '☿' },
    { key: 'houses', label: 'Houses', icon: '🏛' },
    { key: 'aspects', label: 'Aspects', icon: '△' },
    { key: 'midpoints', label: 'Midpoints', icon: '⊕' },
    { key: 'eclipses', label: 'Eclipses', icon: '🌑' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Chart selector for personalization */}
      {allCharts.length > 0 && (activeTab === 'signs' || activeTab === 'planets' || activeTab === 'houses' || activeTab === 'eclipses' || activeTab === 'midpoints') && activeTab !== 'midpoints' && (
        <div className="mb-6">
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={activeTab === 'houses' && !selectedChartId ? '__live_sky__' : (selectedChart?.name || '')}
            onSelect={setSelectedChartId}
            includeGeneral={activeTab === 'houses'}
            generalLabel="✦ Current Sky (Natural Zodiac)"
            generalId="__live_sky__"
          />
        </div>
      )}

      {/* Sub-tab navigation */}
      <div className="flex gap-1 mb-8 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'signs' && (
        <div className="space-y-8">
          <ZodiacSignExplorer />
          {planetHouses.length > 0 && (
            <ElementDistributionCard planetHouses={planetHouses} />
          )}
        </div>
      )}

      {activeTab === 'planets' && <PlanetEncyclopediaExplorer chart={selectedChart} onNavigateToView={onNavigateToView} />}

      {activeTab === 'houses' && (
        <HouseEncyclopediaExplorer chart={selectedChart} onNavigateToView={onNavigateToView} />
      )}

      {activeTab === 'aspects' && (
        <AspectEncyclopediaExplorer
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
        />
      )}

      {activeTab === 'midpoints' && (
        <MidpointExplorer
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
        />
      )}

      {activeTab === 'eclipses' && (
        <EclipseEncyclopediaExplorer
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
        />
      )}
    </div>
  );
}
