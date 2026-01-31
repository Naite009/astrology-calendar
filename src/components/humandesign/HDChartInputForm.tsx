import { useState } from 'react';
import { X } from 'lucide-react';
import { calculateHumanDesignChart } from '@/lib/humanDesignCalculator';
import { HumanDesignChart } from '@/types/humanDesign';

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
  { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: -10 },
  { value: 'Europe/London', label: 'London (GMT)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 7 },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 11 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 13 },
];

export const HDChartInputForm = ({ onSave, onClose, initialData }: HDChartInputFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '',
    birthLocation: initialData?.birthLocation || '',
    timezone: initialData?.timezone || 'America/New_York',
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCalculating(true);

    try {
      const selectedTz = TIMEZONES.find(tz => tz.value === formData.timezone);
      const offset = selectedTz?.offset ?? -5;

      const chart = calculateHumanDesignChart(
        formData.name,
        formData.birthDate,
        formData.birthTime,
        formData.birthLocation,
        formData.timezone,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-sm bg-background p-8 shadow-xl md:p-12"
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

        <p className="mb-6 text-sm text-muted-foreground">
          Enter exact birth data. Accuracy to the minute is essential for precise gate activations.
        </p>

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
              placeholder="City, Country"
              value={formData.birthLocation}
              onChange={(e) => setFormData({ ...formData, birthLocation: e.target.value })}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">
              Birth Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Use the timezone that was in effect at your birth location at that time.
            </p>
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
              disabled={isCalculating}
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
