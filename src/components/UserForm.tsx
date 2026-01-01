import { useState } from 'react';
import { X } from 'lucide-react';
import { UserData } from '@/hooks/useUserData';

interface UserFormProps {
  initialData: UserData | null;
  onSave: (data: UserData) => void;
  onClose: () => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
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
              Current Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full border border-border bg-background px-3 py-3 font-sans text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
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
