import { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { useHumanDesignChart } from '@/hooks/useHumanDesignChart';
import { useUserData } from '@/hooks/useUserData';
import { HDChartInputForm } from './HDChartInputForm';
import { HDChartSummary } from './HDChartSummary';
import { HDActivationsTable } from './HDActivationsTable';
import { Bodygraph } from './Bodygraph';
import { CentersAnalysis } from './CentersAnalysis';
import { ProfileAnalysis } from './ProfileAnalysis';
import { AuthorityGuide } from './AuthorityGuide';
import { TypeAnalysis } from './TypeAnalysis';
import { IncarnationCrossAnalysis } from './IncarnationCrossAnalysis';
import { HumanDesignChart } from '@/types/humanDesign';
import { formatLocalDateLong } from '@/lib/localDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type HDTab = 'overview' | 'type' | 'authority' | 'profile' | 'centers' | 'cross' | 'activations' | 'bodygraph';

export const HumanDesignView = () => {
  const { charts, selectedChart, addChart, deleteChart, selectChart } = useHumanDesignChart();
  const { userData: mainUserData } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<HDTab>('overview');

  const handleSaveChart = (chart: HumanDesignChart) => {
    const savedChart = addChart(chart);
    if (savedChart) {
      selectChart(savedChart.id);
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
              {charts.map(chart => (
                <SelectItem key={chart.id} value={chart.id}>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{chart.name}</span>
                    <span className="text-xs text-muted-foreground">({chart.type})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedChart && (
            <button
              onClick={() => handleDeleteChart(selectedChart.id)}
              className="flex items-center gap-1 px-3 py-2 text-xs border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded"
            >
              <Trash2 size={14} />
              Delete Chart
            </button>
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
          <div className="rounded border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl text-foreground">{selectedChart.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatLocalDateLong(selectedChart.birthDate)}{' '}
                  at {selectedChart.birthTime}
                </p>
                <p className="text-sm text-muted-foreground">{selectedChart.birthLocation}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-light text-primary">{selectedChart.type}</span>
                <p className="text-sm text-muted-foreground">{selectedChart.profile} Profile</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {(['overview', 'type', 'authority', 'profile', 'centers', 'cross', 'activations', 'bodygraph'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'bodygraph' ? 'Chart' : tab === 'cross' ? 'Incarnation Cross' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <HDChartSummary chart={selectedChart} />}
          {activeTab === 'type' && <TypeAnalysis chart={selectedChart} />}
          {activeTab === 'authority' && <AuthorityGuide chart={selectedChart} />}
          {activeTab === 'profile' && <ProfileAnalysis chart={selectedChart} />}
          {activeTab === 'centers' && <CentersAnalysis chart={selectedChart} />}
          {activeTab === 'cross' && <IncarnationCrossAnalysis chart={selectedChart} />}

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
          onClose={() => setShowForm(false)} 
          mainUserData={mainUserData}
        />
      )}
    </div>
  );
};
