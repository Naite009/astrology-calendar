import { useState, useEffect, useMemo } from 'react';
import { X, Info } from 'lucide-react';
import { UserData } from '@/hooks/useUserData';
import { lookupTimezone } from '@/lib/timezoneUtils';

interface UserFormProps {
  initialData: UserData | null;
  onSave: (data: UserData) => void;
  onClose: () => void;
}

const BASE_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

export const UserForm = ({ initialData, onSave, onClose }: UserFormProps) => {
  const [formData, setFormData] = useState<UserData>(
    initialData || {
      name: '',
      birthDate: '',
      birthTime: '',
      birthLocation: '',
      timezone: 'America/New_York',
    }
  );
  const [autoDetectedTz, setAutoDetectedTz] = useState<{ timezone: string; label: string } | null>(null);

  // Auto-detect timezone when location OR date changes
  useEffect(() => {
    if (formData.birthLocation && formData.birthLocation.length > 2) {
      const result = lookupTimezone(formData.birthLocation, formData.birthDate || undefined);
      if (result) {
        setAutoDetectedTz({ timezone: result.timezone, label: result.label });
        setFormData(prev => ({ ...prev, timezone: result.timezone }));
      } else {
        setAutoDetectedTz(null);
      }
    }
  }, [formData.birthLocation, formData.birthDate]);

  // Get DST-aware label for selected timezone
  const currentTzLabel = useMemo(() => {
    if (autoDetectedTz) return autoDetectedTz.label;
    const result = lookupTimezone('', formData.birthDate);
    // For manual selection, compute the label based on the selected timezone
    if (formData.timezone && formData.birthDate) {
      // Create a temporary lookup to get the proper label
      const tempDate = new Date(formData.birthDate + 'T12:00:00');
      const offset = (() => {
        try {
          const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
          const tzDate = new Date(tempDate.toLocaleString('en-US', { timeZone: formData.timezone }));
          return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
        } catch {
          return 0;
        }
      })();
      const offsetStr = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
      return offsetStr;
    }
    return null;
  }, [formData.timezone, formData.birthDate, autoDetectedTz]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
            Birth Information
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

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
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
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
              Birth Time
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
              required
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            />
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
            {autoDetectedTz ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded border border-primary/30 bg-primary/5 px-3 py-3">
                  <span className="text-sm text-foreground">
                    {autoDetectedTz.label}
                  </span>
                  <span className="text-xs text-muted-foreground">(auto-detected)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {autoDetectedTz.label.includes('Daylight') 
                      ? 'Daylight Saving Time was in effect on this date (+1 hour from standard).'
                      : 'Standard time (no daylight saving) was in effect on this date.'}
                    {' '}This affects planetary positions by ~1° for fast-moving planets.
                  </span>
                </div>
              </div>
            ) : (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
              >
                {BASE_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} {currentTzLabel && formData.timezone === tz.value ? `(${currentTzLabel})` : ''}
                  </option>
                ))}
              </select>
            )}
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
              className="border border-primary bg-primary px-5 py-3 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
