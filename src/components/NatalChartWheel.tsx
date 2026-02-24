// Natal Chart Wheel Visualization
// Displays the uploaded chart image or a drag-and-drop area to upload one

import { useState, useCallback, useEffect, useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ZoomIn, ZoomOut, RotateCcw, Download, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChartSelector as ChartSelectorDropdown } from './ChartSelector';
import { normalizeName } from '@/lib/nameMatching';

interface NatalChartWheelProps {
  natalChart: NatalChart | null;
  allCharts?: NatalChart[];
  onChartImageUpload?: (chartId: string, imageBase64: string) => void;
}

export const NatalChartWheel = ({ natalChart: initialChart, allCharts = [], onChartImageUpload }: NatalChartWheelProps) => {
  // Get the user chart (first one passed in if available)
  const userChart = initialChart || allCharts[0] || null;
  
  // Get all charts sorted and deduplicated: user first, then alphabetically
  const allSortedCharts = useMemo(() => {
    const seen = new Set<string>();
    if (userChart) seen.add(normalizeName(userChart.name) + '|' + userChart.birthDate);
    const sorted = [...allCharts]
      .filter(c => {
        if (c.id === userChart?.id) return false;
        const key = normalizeName(c.name) + '|' + c.birthDate;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return userChart ? [userChart, ...sorted] : sorted;
  }, [allCharts, userChart]);
  
  // Initialize selected chart: prefer initialChart, then first chart with image, then first chart
  const [selectedChartId, setSelectedChartId] = useState<string>(() => {
    if (initialChart?.id) return initialChart.id;
    const firstWithImage = allCharts.find(c => c.chartImageBase64);
    if (firstWithImage) return firstWithImage.id;
    return allCharts[0]?.id || '';
  });
  
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  
  // Get the currently selected chart (may or may not have an image)
  const selectedChart = allSortedCharts.find(c => c.id === selectedChartId) || initialChart || allSortedCharts[0];
  
  // Validate base64 image - check if it's a valid data URL or has minimum length
  const chartImageBase64 = selectedChart?.chartImageBase64;
  const isPdfFile = chartImageBase64?.startsWith('data:application/pdf');
  const isValidBase64Image = chartImageBase64 && 
    chartImageBase64.length > 100 && 
    (chartImageBase64.startsWith('data:image/') || isPdfFile);
  const hasImage = isValidBase64Image;
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset error state when chart selection changes
  useEffect(() => {
    setImageLoadError(false);
  }, [selectedChartId]);

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
        console.log('[NatalChartWheel] Uploading to matched chart:', matchedChart.name, 'base64 length:', imageToSave.length, 'prefix:', imageToSave.substring(0, 50));
        onChartImageUpload(matchedChart.id, imageToSave);
        setSelectedChartId(matchedChart.id);
        setImageLoadError(false); // Reset error state
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
    if (!selectedChart?.chartImageBase64) return;
    
    const link = document.createElement('a');
    link.href = selectedChart.chartImageBase64;
    link.download = `${selectedChart.name.replace(/\s+/g, '-').toLowerCase()}-natal-chart.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload to the currently selected chart
  const handleUploadToSelected = useCallback(async (file: File) => {
    if (!selectedChart || !onChartImageUpload) {
      toast({
        title: "No chart selected",
        description: "Please select a chart first",
        variant: "destructive"
      });
      return;
    }
    
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif)$/i.test(fileName);
    
    if (!isImage) {
      toast({
        title: "Please upload an image",
        description: "Supported formats: PNG, JPG, WEBP, GIF",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    
    try {
      const base64 = await base64Promise;
      onChartImageUpload(selectedChart.id, base64);
      toast({
        title: "Chart updated!",
        description: `Saved to "${selectedChart.name}"'s chart`,
      });
    } catch (err) {
      console.error('File upload error:', err);
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedChart, onChartImageUpload, toast]);

  const handleReplaceInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUploadToSelected(files[0]);
    }
    e.target.value = '';
  }, [handleUploadToSelected]);

  // Chart selector component - always shown when there are multiple charts
  const ChartSelector = () => {
    if (allSortedCharts.length <= 1) return null;
    
    return (
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-muted-foreground">Select Chart:</label>
        <select
          value={selectedChartId}
          onChange={(e) => setSelectedChartId(e.target.value)}
          className="flex-1 max-w-xs border border-border bg-background px-3 py-2 text-sm rounded-md focus:border-primary focus:outline-none"
        >
          {allSortedCharts.map((chart, idx) => (
            <option key={chart.id} value={chart.id}>
              {idx === 0 && userChart ? '★ ' : ''}{chart.name} {chart.chartImageBase64 ? '✓' : '(no wheel)'}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Show upload area if no image for selected chart
  if (!hasImage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ChartSelector />
        
        <div className="text-center">
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
               isDragging ? 'Drop Your Chart Here!' : 
               selectedChart ? `Upload ${selectedChart.name}'s Natal Chart` : 'Upload Your Natal Chart'}
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ChartSelector />

      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl mb-2 text-center">{selectedChart.name}'s Natal Chart</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          {selectedChart.birthDate} • {selectedChart.birthTime} • {selectedChart.birthLocation}
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
          <button
            onClick={() => document.getElementById('wheel-chart-replace')?.click()}
            className="p-2 rounded border border-border hover:bg-secondary transition-colors flex items-center gap-1"
            title="Replace Chart Image"
          >
            <Upload size={18} />
          </button>
          <input
            id="wheel-chart-replace"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceInputChange}
          />
        </div>

        {/* Chart Image or PDF */}
        <div className="overflow-auto max-w-full max-h-[70vh] border border-border rounded-lg bg-white p-2">
          {imageLoadError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-destructive mb-2">Image Failed to Load</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The chart image may be corrupted or too large. Try uploading again.
              </p>
              <button
                onClick={() => {
                  setImageLoadError(false);
                  document.getElementById('wheel-chart-replace')?.click();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Upload size={16} />
                Re-upload Chart
              </button>
            </div>
          ) : isPdfFile ? (
            // PDF files need to be displayed with embed/iframe, or show a message
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">PDF Chart Uploaded</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                This chart was saved as a PDF. For best viewing, please re-upload as an image (PNG, JPG).
              </p>
              <div className="flex gap-2">
                <a
                  href={chartImageBase64}
                  download={`${selectedChart.name.replace(/\s+/g, '-').toLowerCase()}-natal-chart.pdf`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </a>
                <button
                  onClick={() => document.getElementById('wheel-chart-replace')?.click()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload as Image
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Tip: Take a screenshot of your PDF chart or export as PNG from astro.com
              </p>
            </div>
          ) : (
            <img
              src={chartImageBase64}
              alt={`${selectedChart.name}'s Natal Chart`}
              className="transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                maxWidth: zoom === 1 ? '100%' : 'none'
              }}
              onError={() => {
                console.error('[NatalChartWheel] Image failed to load, base64 length:', chartImageBase64?.length);
                setImageLoadError(true);
              }}
              onLoad={() => {
                console.log('[NatalChartWheel] Image loaded successfully');
                setImageLoadError(false);
              }}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          This is the chart image you uploaded. Use the zoom controls to view details.
        </p>
      </div>
    </div>
  );
};
