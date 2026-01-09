// Natal Chart Wheel Visualization
// Displays the uploaded chart image or a drag-and-drop area to upload one

import { useState, useCallback } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ZoomIn, ZoomOut, RotateCcw, Download, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NatalChartWheelProps {
  natalChart: NatalChart | null;
  allCharts?: NatalChart[];
  onChartImageUpload?: (chartId: string, imageBase64: string) => void;
}

export const NatalChartWheel = ({ natalChart: initialChart, allCharts = [], onChartImageUpload }: NatalChartWheelProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string>(initialChart?.id || '');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  
  // Get charts that have images
  const chartsWithImages = allCharts.filter(c => c.chartImageBase64);
  const sortedCharts = [...chartsWithImages].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get all charts for matching (including those without images)
  const allSortedCharts = [...allCharts].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get the selected chart
  const natalChart = sortedCharts.find(c => c.id === selectedChartId) || 
                     (initialChart?.chartImageBase64 ? initialChart : null) ||
                     sortedCharts[0];

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      // Try to match chart by name in filename
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
      const matchedChart = allSortedCharts.find(chart => {
        const chartName = chart.name.toLowerCase();
        return fileName.includes(chartName) || chartName.includes(fileName) ||
               fileName.split(/[-_\s]/).some(part => chartName.includes(part) && part.length > 2);
      });
      
      if (matchedChart && onChartImageUpload) {
        onChartImageUpload(matchedChart.id, base64);
        setSelectedChartId(matchedChart.id);
        setUploadStatus('success');
        toast({
          title: "Chart uploaded!",
          description: `Matched to "${matchedChart.name}"'s chart`,
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else if (initialChart && onChartImageUpload) {
        // Default to initial chart if no match found
        onChartImageUpload(initialChart.id, base64);
        setUploadStatus('success');
        toast({
          title: "Chart uploaded!",
          description: `Saved to "${initialChart.name}"'s chart`,
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else if (allSortedCharts.length > 0 && onChartImageUpload) {
        // Use first chart if nothing else available
        onChartImageUpload(allSortedCharts[0].id, base64);
        setSelectedChartId(allSortedCharts[0].id);
        setUploadStatus('success');
        toast({
          title: "Chart uploaded!",
          description: `Saved to "${allSortedCharts[0].name}"'s chart`,
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        setUploadStatus('error');
        toast({
          title: "No chart to save to",
          description: "Please create a chart profile first in the Charts tab",
          variant: "destructive"
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      }
    };
    reader.readAsDataURL(file);
  }, [allSortedCharts, initialChart, onChartImageUpload, toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);
  
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
        <div 
          className={`bg-secondary/50 rounded-lg p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-secondary/70'}
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-500/10' : ''}
            ${uploadStatus === 'error' ? 'border-red-500 bg-red-500/10' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('wheel-chart-upload')?.click()}
        >
          <input
            id="wheel-chart-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          <div className="text-6xl mb-4">
            {uploadStatus === 'success' ? '✅' : uploadStatus === 'error' ? '❌' : isDragging ? '📥' : '🌌'}
          </div>
          
          <h3 className="text-xl font-serif mb-3 text-foreground">
            {uploadStatus === 'success' ? 'Chart Uploaded!' : 
             uploadStatus === 'error' ? 'Upload Failed' :
             isDragging ? 'Drop Your Chart Here!' : 'No Chart Image Uploaded'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {isDragging ? (
              'Release to upload your natal chart wheel'
            ) : (
              <>
                <span className="font-medium text-primary">Drag & drop</span> your natal chart image here, or{' '}
                <span className="font-medium text-primary underline">click to browse</span>
              </>
            )}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Upload size={16} />
            <span>Supports PNG, JPG, WEBP from astro.com or any astrology site</span>
          </div>
          
          {allSortedCharts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                💡 <strong>Tip:</strong> Name your file with the chart name (e.g., "John-chart.png") for automatic matching
              </p>
              <p className="text-xs text-muted-foreground">
                Available charts: {allSortedCharts.map(c => c.name).join(', ')}
              </p>
            </div>
          )}
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
