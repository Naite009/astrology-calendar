import { useState, useMemo } from 'react';
import { Plus, User, Trash2, Edit3, Star, Link2 } from 'lucide-react';
import { useHumanDesignChart } from '@/hooks/useHumanDesignChart';
import { useUserData } from '@/hooks/useUserData';
import { useNatalChart } from '@/hooks/useNatalChart';
import { findLinkedNatalChart } from '@/hooks/useUnifiedProfiles';
import { HDChartInputForm } from './HDChartInputForm';
import { HDChartSummary } from './HDChartSummary';
import { HDActivationsTable } from './HDActivationsTable';
import { HDGatesTab } from './HDGatesTab';
import { HDChannelsTab } from './HDChannelsTab';
import { Bodygraph } from './Bodygraph';
import { CentersAnalysis } from './CentersAnalysis';
import { ProfileAnalysis } from './ProfileAnalysis';
import { AuthorityGuide } from './AuthorityGuide';
import { TypeAnalysis } from './TypeAnalysis';
import { IncarnationCrossAnalysis } from './IncarnationCrossAnalysis';
import { VariablesAnalysis } from './VariablesAnalysis';
import { HumanDesignChart } from '@/types/humanDesign';
import { formatLocalDateLong } from '@/lib/localDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type HDTab = 'overview' | 'type' | 'authority' | 'profile' | 'centers' | 'gates' | 'channels' | 'cross' | 'variables' | 'activations' | 'bodygraph';

export const HumanDesignView = () => {
  const { charts, selectedChart, addChart, updateChart, deleteChart, selectChart } = useHumanDesignChart();
  const { userData: mainUserData } = useUserData();
  const { userNatalChart, savedCharts: savedNatalCharts } = useNatalChart();
  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<HumanDesignChart | null>(null);
  const [activeTab, setActiveTab] = useState<HDTab>('overview');

  // Sort charts: user's chart first with ★, then alphabetical
  const sortedCharts = useMemo(() => {
    const userName = mainUserData?.name?.toLowerCase().trim() || '';
    const userChart = charts.find(c => c.name?.toLowerCase().trim() === userName);
    const others = charts
      .filter(c => c.id !== userChart?.id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return userChart ? [userChart, ...others] : others;
  }, [charts, mainUserData]);

  const userHdChartId = sortedCharts.length > 0 && mainUserData
    ? sortedCharts.find(c => c.name?.toLowerCase().trim() === mainUserData.name?.toLowerCase().trim())?.id
    : undefined;

  const handleSaveChart = (chart: HumanDesignChart) => {
    console.log('[HumanDesignView] handleSaveChart called with:', chart.name, chart.type);
    if (editingChart) {
      // Update existing chart
      updateChart(editingChart.id, chart);
      selectChart(editingChart.id);
      setEditingChart(null);
    } else {
      // Add new chart
      const savedChart = addChart(chart);
      console.log('[HumanDesignView] addChart result:', savedChart);
      if (savedChart) {
        selectChart(savedChart.id);
      }
    }
  };

  const handleEditChart = () => {
    if (selectedChart) {
      setEditingChart(selectedChart);
      setShowForm(true);
    }
  };

  const handleDeleteChart = (id: string) => {
    if (confirm('Delete this chart?')) {
      deleteChart(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground">Human Design</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculate and analyze Human Design charts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={14} />
          New Chart
        </button>
      </div>

      {/* Chart Selector - Always Visible */}
      <div className="rounded border border-border bg-card p-4">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Select Chart
        </span>
        <div className="mt-3 flex items-center gap-4">
          <Select
            value={selectedChart?.id || ''}
            onValueChange={(value) => selectChart(value)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={charts.length > 0 ? "Choose a chart..." : "No charts saved yet"} />
            </SelectTrigger>
            <SelectContent>
              {sortedCharts.map(chart => {
                const linkedNatal = findLinkedNatalChart(chart, userNatalChart, savedNatalCharts);
                return (
                  <SelectItem key={chart.id} value={chart.id}>
                    <div className="flex items-center gap-2">
                      {chart.id === userHdChartId ? (
                        <span className="text-primary">★</span>
                      ) : (
                        <User size={14} />
                      )}
                      <span>{chart.name}</span>
                      <span className="text-xs text-muted-foreground">({chart.type})</span>
                      {linkedNatal && (
                        <span className="flex items-center gap-0.5 text-xs text-primary" title="Linked to natal chart">
                          <Link2 size={10} />
                          ☉
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedChart && (
            <>
              <button
                onClick={handleEditChart}
                className="flex items-center gap-1 px-3 py-2 text-xs border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded"
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDeleteChart(selectedChart.id)}
                className="flex items-center gap-1 px-3 py-2 text-xs border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )}
        </div>
        
        {charts.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first Human Design chart to get started.
          </p>
        )}
      </div>

      {/* Selected Chart Display */}
      {selectedChart ? (
        <div className="space-y-6">
          {/* Chart Header */}
          {(() => {
            const linkedNatal = findLinkedNatalChart(selectedChart, userNatalChart, savedNatalCharts);
            return (
              <div className="rounded border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-foreground">{selectedChart.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatLocalDateLong(selectedChart.birthDate)}{' '}
                      at {selectedChart.birthTime}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedChart.birthLocation}</p>
                    {linkedNatal && (
                      <div className="mt-2 flex items-center gap-2 rounded border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
                        <Link2 size={12} />
                        <span>
                          Linked to natal chart — {linkedNatal.planets?.Sun?.sign && `☉ ${linkedNatal.planets.Sun.sign}`}
                          {linkedNatal.planets?.Moon?.sign && ` · ☽ ${linkedNatal.planets.Moon.sign}`}
                          {linkedNatal.planets?.Ascendant?.sign && ` · ASC ${linkedNatal.planets.Ascendant.sign}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-light text-primary">{selectedChart.type}</span>
                    <p className="text-sm text-muted-foreground">{selectedChart.profile} Profile</p>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {(['overview', 'type', 'authority', 'profile', 'centers', 'gates', 'channels', 'cross', 'variables', 'activations', 'bodygraph'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'bodygraph' ? 'Chart' : 
                 tab === 'cross' ? 'Incarnation Cross' : 
                 tab === 'variables' ? 'Variables (PHS)' : 
                 tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <HDChartSummary chart={selectedChart} />}
          {activeTab === 'type' && <TypeAnalysis chart={selectedChart} />}
          {activeTab === 'authority' && <AuthorityGuide chart={selectedChart} />}
          {activeTab === 'profile' && <ProfileAnalysis chart={selectedChart} />}
          {activeTab === 'centers' && <CentersAnalysis chart={selectedChart} />}
          {activeTab === 'gates' && <HDGatesTab chart={selectedChart} />}
          {activeTab === 'channels' && <HDChannelsTab chart={selectedChart} />}
          {activeTab === 'cross' && <IncarnationCrossAnalysis chart={selectedChart} />}
          {activeTab === 'variables' && <VariablesAnalysis chart={selectedChart} />}

          {activeTab === 'bodygraph' && (
            <div className="rounded border border-border bg-card p-6">
              <div className="mb-4 rounded border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
                ⚠️ The bodygraph visual is in beta. Use other tabs for accurate data.
              </div>
              <Bodygraph chart={selectedChart} />
            </div>
          )}

          {activeTab === 'activations' && (
            <div className="rounded border border-border bg-card p-6">
              <h4 className="mb-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Planetary Gate Activations
              </h4>
              <HDActivationsTable
                personalityActivations={selectedChart.personalityActivations}
                designActivations={selectedChart.designActivations}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded border border-dashed border-border p-12 text-center">
          <div className="mb-4 text-6xl opacity-20">◇</div>
          <h3 className="font-serif text-lg text-foreground">No Chart Selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new Human Design chart or select one from your library
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={14} />
            Create Chart
          </button>
        </div>
      )}

      {showForm && (
        <HDChartInputForm 
          onSave={handleSaveChart} 
          onClose={() => {
            setShowForm(false);
            setEditingChart(null);
          }} 
          initialData={editingChart || undefined}
          mainUserData={mainUserData}
        />
      )}
    </div>
  );
};
