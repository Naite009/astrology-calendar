import { useState } from 'react';
import { Plus, User, Trash2, ChevronDown } from 'lucide-react';
import { useHumanDesignChart } from '@/hooks/useHumanDesignChart';
import { useUserData } from '@/hooks/useUserData';
import { HDChartInputForm } from './HDChartInputForm';
import { HDChartSummary } from './HDChartSummary';
import { HDActivationsTable } from './HDActivationsTable';
import { Bodygraph } from './Bodygraph';
import { HumanDesignChart } from '@/types/humanDesign';
import { formatLocalDateLong } from '@/lib/localDate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const HumanDesignView = () => {
  const { charts, selectedChart, addChart, deleteChart, selectChart } = useHumanDesignChart();
  const { userData: mainUserData } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activations' | 'centers' | 'bodygraph'>('overview');

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
              className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={12} />
              Delete
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

          <div className="flex gap-1 border-b border-border">
            {(['overview', 'activations', 'centers', 'bodygraph'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'bodygraph' ? 'Bodygraph (Beta)' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && <HDChartSummary chart={selectedChart} />}

          {activeTab === 'bodygraph' && (
            <div className="rounded border border-border bg-card p-6">
              <div className="mb-4 rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ The bodygraph visual is in beta and may have layout issues. Use the Activations tab for accurate gate data.
              </div>
              <h4 className="mb-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Interactive Bodygraph
              </h4>
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
              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Personality (Black):</span> Birth moment
                </span>
                <span>
                  <span className="font-medium text-destructive">Design (Red):</span> 88° before birth
                </span>
              </div>
            </div>
          )}

          {activeTab === 'centers' && (
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-2">
                {selectedChart.definedCenters.map(center => (
                  <AccordionItem
                    key={center}
                    value={center}
                    className="rounded border border-primary/30 bg-primary/5"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">{center}</span>
                        <span className="text-xs text-muted-foreground">Defined</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                      This center is consistently defined in your chart, giving you reliable access
                      to its energy.
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {selectedChart.undefinedCenters.map(center => (
                  <AccordionItem
                    key={center}
                    value={center}
                    className="rounded border border-border bg-card"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                        <span className="text-muted-foreground">{center}</span>
                        <span className="text-xs text-muted-foreground">Open</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                      This center is undefined, meaning you take in and amplify energy from others
                      here. This is where you have wisdom potential through sampling others.
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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

      {/* Form Modal */}
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
