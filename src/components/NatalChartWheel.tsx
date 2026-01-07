// Natal Chart Wheel Visualization
// Displays the uploaded chart image or a message to upload one

import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface NatalChartWheelProps {
  natalChart: NatalChart | null;
  allCharts?: NatalChart[];
}

export const NatalChartWheel = ({ natalChart: initialChart, allCharts = [] }: NatalChartWheelProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(initialChart?.id || '');
  const [zoom, setZoom] = useState(1);
  
  // Get charts that have images
  const chartsWithImages = allCharts.filter(c => c.chartImageBase64);
  const sortedCharts = [...chartsWithImages].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get the selected chart
  const natalChart = sortedCharts.find(c => c.id === selectedChartId) || 
                     (initialChart?.chartImageBase64 ? initialChart : null) ||
                     sortedCharts[0];
  
  // Handle download
  const handleDownload = () => {
    if (!natalChart?.chartImageBase64) return;
    
    const link = document.createElement('a');
    link.href = natalChart.chartImageBase64;
    link.download = `${natalChart.name.replace(/\s+/g, '-').toLowerCase()}-natal-chart.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!natalChart || !natalChart.chartImageBase64) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center">
        <div className="bg-secondary/50 rounded-lg p-8 border border-border">
          <div className="text-6xl mb-4">🌌</div>
          <h3 className="text-xl font-serif mb-3 text-foreground">No Chart Image Uploaded</h3>
          <p className="text-muted-foreground mb-4">
            To see your natal chart wheel here, go to the <span className="font-medium text-foreground">Charts</span> tab 
            and use the <span className="font-medium text-foreground">Upload Chart Image</span> feature to import your 
            chart from astro.com or another astrology site.
          </p>
          <p className="text-sm text-muted-foreground">
            The uploaded image will be saved and displayed here for easy reference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chart Selector */}
      {sortedCharts.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-muted-foreground">Select Chart:</label>
          <select
            value={selectedChartId || natalChart.id}
            onChange={(e) => setSelectedChartId(e.target.value)}
            className="flex-1 max-w-xs border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {sortedCharts.map(chart => (
              <option key={chart.id} value={chart.id}>
                {chart.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl mb-2 text-center">{natalChart.name}'s Natal Chart</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          {natalChart.birthDate} • {natalChart.birthTime} • {natalChart.birthLocation}
        </p>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-2 rounded border border-border hover:bg-secondary transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded border border-border hover:bg-secondary transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            className="p-2 rounded border border-border hover:bg-secondary transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <span className="text-sm text-muted-foreground ml-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleDownload}
            className="p-2 rounded border border-border hover:bg-secondary transition-colors ml-4"
            title="Download Image"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Chart Image */}
        <div className="overflow-auto max-w-full max-h-[70vh] border border-border rounded-lg bg-white p-2">
          <img
            src={natalChart.chartImageBase64}
            alt={`${natalChart.name}'s Natal Chart`}
            className="transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              maxWidth: zoom === 1 ? '100%' : 'none'
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          This is the chart image you uploaded. Use the zoom controls to view details.
        </p>
      </div>
    </div>
  );
};
