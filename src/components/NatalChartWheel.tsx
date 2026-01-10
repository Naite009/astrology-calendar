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

// Handle file upload - supports images, PDFs, and documents
  const handleFileUpload = useCallback(async (file: File) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    // Check supported file types
    const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif)$/i.test(fileName);
    const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
    const isWord = fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
    
    if (!isImage && !isPDF && !isWord) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image (PNG, JPG), PDF, or Word document",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus('success'); // Show uploading state
    
    // Read file as base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    try {
      const base64 = await base64Promise;
      
      // For PDFs and Word docs, we'll just save the first page preview or a placeholder
      // The actual parsing should happen in Charts section
      let imageToSave = base64;
      
      // If it's a PDF or Word doc, show a message about going to Charts for full parsing
      if (isPDF || isWord) {
        toast({
          title: "Document received",
          description: "For full chart parsing, upload in the Charts section. Saving reference here.",
        });
      }
      
      // Try to match chart by name in filename
      const cleanFileName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      const matchedChart = allSortedCharts.find(chart => {
        const chartName = chart.name.toLowerCase();
        return cleanFileName.includes(chartName) || chartName.includes(cleanFileName) ||
               cleanFileName.split(/[-_\s]/).some(part => chartName.includes(part) && part.length > 2);
      });
      
      if (matchedChart && onChartImageUpload) {
        onChartImageUpload(matchedChart.id, imageToSave);
        setSelectedChartId(matchedChart.id);
        setUploadStatus('success');
        toast({
          title: "Chart uploaded!",
          description: `Matched to "${matchedChart.name}"'s chart`,
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else if (initialChart && onChartImageUpload) {
        onChartImageUpload(initialChart.id, imageToSave);
        setUploadStatus('success');
        toast({
          title: "Chart uploaded!",
          description: `Saved to "${initialChart.name}"'s chart`,
        });
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else if (allSortedCharts.length > 0 && onChartImageUpload) {
        onChartImageUpload(allSortedCharts[0].id, imageToSave);
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
    } catch (err) {
      console.error('File upload error:', err);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive"
      });
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
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

const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
    // Reset input so same file can be uploaded again
    e.target.value = '';
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
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div 
          className={`bg-secondary/30 rounded-xl p-12 border-3 border-dashed transition-all duration-300 cursor-pointer min-h-[400px] flex flex-col items-center justify-center
            ${isDragging ? 'border-primary bg-primary/15 scale-[1.02] shadow-lg shadow-primary/20' : 'border-border/60 hover:border-primary/60 hover:bg-secondary/50'}
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-500/10' : ''}
            ${uploadStatus === 'error' ? 'border-destructive bg-destructive/10' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('wheel-chart-upload')?.click()}
        >
          <input
            id="wheel-chart-upload"
            type="file"
            accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          <div className={`text-7xl mb-6 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
            {uploadStatus === 'success' ? '✅' : uploadStatus === 'error' ? '❌' : isDragging ? '📥' : '🌌'}
          </div>
          
          <h3 className="text-2xl font-serif mb-4 text-foreground">
            {uploadStatus === 'success' ? 'Chart Uploaded!' : 
             uploadStatus === 'error' ? 'Upload Failed' :
             isDragging ? 'Drop Your Chart Here!' : 'Upload Your Natal Chart'}
          </h3>
          
          <p className="text-muted-foreground mb-6 text-lg">
            {isDragging ? (
              'Release to upload your natal chart wheel'
            ) : (
              <>
                <span className="font-semibold text-primary">Drag & drop</span> your chart file here
                <br />
                <span className="text-sm">or <span className="font-semibold text-primary underline">click to browse</span></span>
              </>
            )}
          </p>
          
          {/* File type badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">PNG</span>
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">JPG</span>
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">WEBP</span>
            <span className="px-3 py-1.5 rounded-full bg-accent/30 text-accent-foreground text-xs font-medium border border-accent/30">PDF</span>
            <span className="px-3 py-1.5 rounded-full bg-accent/30 text-accent-foreground text-xs font-medium border border-accent/30">DOCX</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Upload size={18} />
            <span>Works with astro.com, Cafe Astrology, or any chart image/document</span>
          </div>
          
          {allSortedCharts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border/30 w-full max-w-md">
              <p className="text-sm text-muted-foreground mb-2">
                💡 <strong>Tip:</strong> Name your file with the chart name for automatic matching
              </p>
              <p className="text-xs text-muted-foreground/70">
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
