import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Users, RefreshCw, Check } from 'lucide-react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getPlanetSymbol, calculateNatalChart, detectTimezoneFromLocation } from '@/lib/astrology';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Core planets plus points and asteroids
const PLANETS = [
  'Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 
  'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Chiron', 'Lilith', 
  'Ceres', 'Pallas', 'Juno', 'Vesta'
] as const;

const PLANET_LABELS: Record<string, string> = {
  NorthNode: 'North Node',
  Lilith: 'Black ☽ Lilith',
  Ceres: 'Ceres',
  Pallas: 'Pallas',
  Juno: 'Juno',
  Vesta: 'Vesta',
  Chiron: 'Chiron',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'ASC',
  NorthNode: '☊',
  Chiron: '⚷',
  Lilith: '⚸',
  Ceres: '⚳',
  Pallas: '⚴',
  Juno: '⚵',
  Vesta: '⚶',
};

const TIMEZONE_OPTIONS = [
  { value: 0, label: 'UTC (0:00)' },
  { value: -5, label: 'EST (UTC-5)' },
  { value: -4, label: 'EDT (UTC-4)' },
  { value: -6, label: 'CST (UTC-6)' },
  { value: -5, label: 'CDT (UTC-5)' },
  { value: -7, label: 'MST (UTC-7)' },
  { value: -6, label: 'MDT (UTC-6)' },
  { value: -8, label: 'PST (UTC-8)' },
  { value: -7, label: 'PDT (UTC-7)' },
  { value: 1, label: 'CET (UTC+1)' },
  { value: 2, label: 'CEST (UTC+2)' },
  { value: 5.5, label: 'IST (UTC+5:30)' },
  { value: 8, label: 'CST China (UTC+8)' },
  { value: 9, label: 'JST (UTC+9)' },
  { value: 10, label: 'AEST (UTC+10)' },
];

interface ChartLibraryProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  onSaveUserChart: (chart: NatalChart) => void;
  onAddChart: (chart: NatalChart) => NatalChart;
  onUpdateChart: (id: string, chart: Partial<NatalChart>) => void;
  onDeleteChart: (id: string) => void;
}

interface ChartFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezoneOffset: number;
  detectedTimezone?: string;
  planets: Record<string, NatalPlanetPosition>;
}

const emptyPlanets = (): Record<string, NatalPlanetPosition> => {
  const planets: Record<string, NatalPlanetPosition> = {};
  PLANETS.forEach(p => {
    planets[p] = { sign: '', degree: 0, minutes: 0, seconds: 0 };
  });
  return planets;
};

export const ChartLibrary = ({
  userNatalChart,
  savedCharts,
  onSaveUserChart,
  onAddChart,
  onUpdateChart,
  onDeleteChart,
}: ChartLibraryProps) => {
  const [editingChart, setEditingChart] = useState<'new' | 'user' | NatalChart | null>(null);
  const [formData, setFormData] = useState<ChartFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    timezoneOffset: -5, // Default to EST
    planets: emptyPlanets(),
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNewChartRef = useRef(false);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (!editingChart) return;
    
    // Don't auto-save new charts until they have a name
    if (editingChart === 'new' && !formData.name.trim()) return;
    
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (editingChart === 'user') {
        onSaveUserChart({
          id: 'user',
          ...formData,
        });
      } else if (editingChart === 'new' && formData.name.trim()) {
        const newChart = onAddChart({
          id: '',
          ...formData,
        });
        isNewChartRef.current = false;
        setEditingChart(newChart);
      } else if (typeof editingChart === 'object') {
        onUpdateChart(editingChart.id, formData);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 800);
  }, [editingChart, formData, onSaveUserChart, onAddChart, onUpdateChart]);

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (editingChart) {
      triggerAutoSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, triggerAutoSave]);

  const openEditForm = (chart: 'new' | 'user' | NatalChart) => {
    isNewChartRef.current = chart === 'new';
    if (chart === 'new') {
      setFormData({
        name: '',
        birthDate: '',
        birthTime: '',
        birthLocation: '',
        timezoneOffset: -5,
        planets: emptyPlanets(),
      });
    } else if (chart === 'user' && userNatalChart) {
      setFormData({
        name: userNatalChart.name,
        birthDate: userNatalChart.birthDate,
        birthTime: userNatalChart.birthTime,
        birthLocation: userNatalChart.birthLocation,
        timezoneOffset: userNatalChart.timezoneOffset ?? -5,
        planets: userNatalChart.planets as Record<string, NatalPlanetPosition>,
      });
    } else if (typeof chart === 'object') {
      setFormData({
        name: chart.name,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthLocation: chart.birthLocation,
        timezoneOffset: chart.timezoneOffset ?? -5,
        planets: chart.planets as Record<string, NatalPlanetPosition>,
      });
    }
    setEditingChart(chart);
    setSaveStatus('idle');
  };

  const updatePlanet = (planet: string, field: keyof NatalPlanetPosition, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      planets: {
        ...prev.planets,
        [planet]: {
          ...prev.planets[planet],
          [field]: field === 'sign' ? value : Number(value),
        },
      },
    }));
  };

  const calculateFromBirthData = () => {
    if (!formData.birthDate) return;
    
    // Auto-detect timezone based on location and date
    let detectedTz: string | undefined;
    if (formData.birthLocation && formData.birthDate) {
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const tempDate = new Date(year, month - 1, day);
      const detected = detectTimezoneFromLocation(formData.birthLocation, tempDate);
      if (detected) {
        detectedTz = detected.abbrev;
        setFormData(prev => ({ 
          ...prev, 
          timezoneOffset: detected.offset,
          detectedTimezone: detected.abbrev
        }));
      }
    }
    
    const calculatedPositions = calculateNatalChart(
      formData.birthDate, 
      formData.birthTime || '12:00',
      formData.timezoneOffset,
      formData.birthLocation
    );
    
    setFormData(prev => ({
      ...prev,
      planets: {
        ...prev.planets,
        ...calculatedPositions,
      },
      ...(detectedTz ? { detectedTimezone: detectedTz } : {}),
    }));
  };

  const handleClose = () => {
    // Save immediately on close if there are unsaved changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (editingChart === 'user' && formData.name.trim()) {
      onSaveUserChart({ id: 'user', ...formData });
    } else if (editingChart === 'new' && formData.name.trim()) {
      onAddChart({ id: '', ...formData });
    } else if (typeof editingChart === 'object') {
      onUpdateChart(editingChart.id, formData);
    }
    
    setEditingChart(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={28} />
          <h2 className="font-serif text-2xl font-light text-foreground">Chart Library</h2>
        </div>
        <button
          onClick={() => openEditForm('new')}
          className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Add Chart
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* User's Personal Chart */}
        <div className="rounded-sm border-2 border-primary/30 bg-secondary p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-medium text-foreground">Your Chart</h3>
            <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-sm">
              Primary
            </span>
          </div>
          {userNatalChart ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{userNatalChart.name}</p>
              <p className="text-sm text-foreground mb-3">
                ☉ {userNatalChart.planets.Sun?.degree}° {userNatalChart.planets.Sun?.sign}
              </p>
              <button
                onClick={() => openEditForm('user')}
                className="text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                Edit
              </button>
            </>
          ) : (
            <button
              onClick={() => openEditForm('user')}
              className="text-sm text-primary hover:underline"
            >
              + Add your natal chart
            </button>
          )}
        </div>

        {/* Saved Charts */}
        {savedCharts.map(chart => (
          <div key={chart.id} className="rounded-sm border border-border bg-secondary p-5">
            <h3 className="font-serif text-lg font-medium text-foreground mb-2">{chart.name}</h3>
            <p className="text-sm text-foreground mb-3">
              ☉ {chart.planets.Sun?.degree}° {chart.planets.Sun?.sign}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => openEditForm(chart)}
                className="text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteChart(chart.id)}
                className="text-[11px] uppercase tracking-widest text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      {editingChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={handleClose}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  {editingChart === 'new' ? 'Add New Chart' : editingChart === 'user' ? 'Your Natal Chart' : 'Edit Chart'}
                </h2>
                {saveStatus === 'saving' && (
                  <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600">
                    <Check size={12} /> Saved
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Time</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Timezone at Birth</label>
                  <select
                    value={formData.timezoneOffset}
                    onChange={e => setFormData({ ...formData, timezoneOffset: Number(e.target.value) })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    {TIMEZONE_OPTIONS.map((tz, i) => (
                      <option key={`${tz.value}-${i}`} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Location</label>
                  <input
                    type="text"
                    value={formData.birthLocation}
                    onChange={e => setFormData({ ...formData, birthLocation: e.target.value })}
                    placeholder="City, Country (for reference)"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">Planet Positions</h3>
                  <div className="flex items-center gap-4">
                    {formData.detectedTimezone && (
                      <span className="text-[10px] text-green-600 bg-green-100 px-2 py-1 rounded">
                        Auto-detected: {formData.detectedTimezone}
                      </span>
                    )}
                    <button
                      onClick={calculateFromBirthData}
                      disabled={!formData.birthDate}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={12} />
                      Calculate from birth data
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic mb-4">
                  Click "Calculate" to auto-fill positions including Ascendant (requires recognized city). ℞ indicates retrograde.
                </p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {PLANETS.map(planet => (
                    <div key={planet} className="grid grid-cols-[40px_110px_1fr_70px_70px_70px_30px] gap-2 items-center">
                      <span className="text-lg">{PLANET_SYMBOLS[planet] || getPlanetSymbol(planet.toLowerCase())}</span>
                      <span className="text-sm text-foreground">{PLANET_LABELS[planet] || planet}</span>
                      <select
                        value={formData.planets[planet]?.sign || ''}
                        onChange={e => updatePlanet(planet, 'sign', e.target.value)}
                        className="border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="">Select Sign</option>
                        {ZODIAC_SIGNS.map(sign => (
                          <option key={sign} value={sign}>{sign}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="29"
                          placeholder="0"
                          value={formData.planets[planet]?.degree ?? ''}
                          onChange={e => updatePlanet(planet, 'degree', e.target.value)}
                          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">°</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="0"
                          value={formData.planets[planet]?.minutes ?? ''}
                          onChange={e => updatePlanet(planet, 'minutes', e.target.value)}
                          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">′</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="0"
                          value={formData.planets[planet]?.seconds ?? ''}
                          onChange={e => updatePlanet(planet, 'seconds', e.target.value)}
                          className="w-full border border-border bg-background px-2 py-1.5 pr-5 text-sm text-center focus:border-primary focus:outline-none"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">″</span>
                      </div>
                      <span className="text-sm text-amber-600 font-medium">
                        {formData.planets[planet]?.isRetrograde ? '℞' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={handleClose}
                  className="border border-primary bg-primary px-5 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};