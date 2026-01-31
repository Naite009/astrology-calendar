import { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
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

export const HumanDesignView = () => {
  const { charts, selectedChart, addChart, deleteChart, selectChart } = useHumanDesignChart();
  const { userData: mainUserData } = useUserData();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'bodygraph' | 'overview' | 'activations' | 'centers'>('bodygraph');

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

      {/* Chart Library */}
      {charts.length > 0 && (
        <div className="rounded border border-border bg-card p-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Saved Charts
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {charts.map(chart => (
              <div
                key={chart.id}
                className={`group flex items-center gap-2 rounded border px-3 py-2 text-sm transition-colors cursor-pointer ${
                  selectedChart?.id === chart.id
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => selectChart(chart.id)}
              >
                <User size={14} />
                <span>{chart.name}</span>
                <span className="text-xs text-muted-foreground">({chart.type})</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChart(chart.id);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(['bodygraph', 'overview', 'activations', 'centers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'bodygraph' && (
            <div className="rounded border border-border bg-card p-6">
              <h4 className="mb-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                Interactive Bodygraph
              </h4>
              <Bodygraph chart={selectedChart} />
            </div>
          )}

          {activeTab === 'overview' && <HDChartSummary chart={selectedChart} />}

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
                  <span className="font-medium text-red-400">Design (Red):</span> 88° before birth
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
