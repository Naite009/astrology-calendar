import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, FileImage, Loader2 } from 'lucide-react';
import { calculateHumanDesignChart } from '@/lib/humanDesignCalculator';
import { HumanDesignChart } from '@/types/humanDesign';
import { lookupTimezone } from '@/lib/timezoneUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HDChartInputFormProps {
  onSave: (chart: HumanDesignChart) => void;
  onClose: () => void;
  initialData?: Partial<HumanDesignChart>;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain (MT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)', offset: -8 },
  { value: 'America/Phoenix', label: 'Arizona (MST)', offset: -7 },
  { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: -10 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 7 },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: 12 },
];

export const HDChartInputForm = ({ onSave, onClose, initialData }: HDChartInputFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '',
    birthLocation: initialData?.birthLocation || '',
    timezone: initialData?.timezone || '',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timezoneAutoDetected, setTimezoneAutoDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-detect timezone when location or birth date changes
  useEffect(() => {
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    if (formData.birthLocation) {
      locationDebounceRef.current = setTimeout(() => {
        const result = lookupTimezone(formData.birthLocation, formData.birthDate || undefined);
        if (result) {
          setFormData(prev => ({ ...prev, timezone: result.timezone }));
          setTimezoneAutoDetected(true);
        }
      }, 500); // Debounce 500ms
    }

    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, [formData.birthLocation, formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);

    try {
      const selectedTz = TIMEZONES.find(tz => tz.value === formData.timezone);
      // Calculate the actual offset for the birth date
      let offset = selectedTz?.offset ?? -5;
      
      // Try to get accurate offset for the timezone and date
      if (formData.timezone && formData.birthDate) {
        try {
          const birthDateTime = new Date(formData.birthDate);
          const utcDate = new Date(birthDateTime.toLocaleString('en-US', { timeZone: 'UTC' }));
          const tzDate = new Date(birthDateTime.toLocaleString('en-US', { timeZone: formData.timezone }));
          offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
        } catch {
          // Fall back to default offset
        }
      }

      const chart = calculateHumanDesignChart(
        formData.name,
        formData.birthDate,
        formData.birthTime,
        formData.birthLocation,
        formData.timezone || 'America/New_York',
        offset
      );

      onSave(chart);
      onClose();
    } catch (err) {
      console.error('Failed to calculate chart:', err);
      setError('Failed to calculate chart. Please check your birth data.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseHDChart = async (file: File) => {
    setIsParsing(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Determine file type
      let fileType = 'image';
      if (file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        fileType = 'word';
      }

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke('parse-hd-chart', {
        body: {
          imageBase64,
          fileType,
          fileName: file.name,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to parse chart');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.data) {
        const parsed = data.data;
        
        // Fill in form data from parsed results
        if (parsed.birthInfo) {
          setFormData(prev => ({
            ...prev,
            name: parsed.birthInfo.name || prev.name,
            birthDate: parsed.birthInfo.birthDate || prev.birthDate,
            birthTime: parsed.birthInfo.birthTime || prev.birthTime,
            birthLocation: parsed.birthInfo.birthLocation || prev.birthLocation,
          }));
        }

        // If we got full HD data, we could create the chart directly
        if (parsed.hdType && parsed.profile && parsed.designActivations && parsed.personalityActivations) {
          toast.success('HD chart parsed successfully! Verify the data and click Generate Chart.');
        } else if (parsed.birthInfo) {
          toast.success('Birth data extracted. Fill in any missing fields.');
        } else {
          toast.info('Some data extracted. Please verify and complete the form.');
        }
      }
    } catch (err) {
      console.error('Failed to parse chart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse chart image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
        setError('Please upload an image (JPG, PNG, WEBP) or PDF file.');
        return;
      }
      await parseHDChart(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await parseHDChart(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-sm bg-background p-8 shadow-xl md:p-12 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Human Design Chart
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-6 border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${isParsing ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isParsing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Parsing chart...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 mb-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <FileImage className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drag & drop HD chart image or PDF
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse • JPG, PNG, PDF supported
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">or enter manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {error && (
          <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Chart name"
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Time (Exact)
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              required
              step="60"
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Birth time accuracy is critical for Human Design. If unsure, use birth certificate time.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Location
            </label>
            <input
              type="text"
              placeholder="City, State/Country"
              value={formData.birthLocation}
              onChange={(e) => {
                setFormData({ ...formData, birthLocation: e.target.value });
                setTimezoneAutoDetected(false);
              }}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Timezone will auto-detect based on location
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Timezone
              {timezoneAutoDetected && formData.timezone && (
                <span className="ml-2 text-primary normal-case">✓ Auto-detected</span>
              )}
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => {
                setFormData({ ...formData, timezone: e.target.value });
                setTimezoneAutoDetected(false);
              }}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="">Select timezone...</option>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-transparent px-5 py-3 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCalculating || isParsing || !formData.timezone}
              className="border border-primary bg-primary px-5 py-3 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isCalculating ? 'Calculating...' : 'Generate Chart'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
