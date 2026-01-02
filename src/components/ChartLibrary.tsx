import { useState } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getPlanetSymbol } from '@/lib/astrology';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANETS = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;

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
    planets: emptyPlanets(),
  });

  const openEditForm = (chart: 'new' | 'user' | NatalChart) => {
    if (chart === 'new') {
      setFormData({
        name: '',
        birthDate: '',
        birthTime: '',
        birthLocation: '',
        planets: emptyPlanets(),
      });
    } else if (chart === 'user' && userNatalChart) {
      setFormData({
        name: userNatalChart.name,
        birthDate: userNatalChart.birthDate,
        birthTime: userNatalChart.birthTime,
        birthLocation: userNatalChart.birthLocation,
        planets: userNatalChart.planets as Record<string, NatalPlanetPosition>,
      });
    } else if (typeof chart === 'object') {
      setFormData({
        name: chart.name,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthLocation: chart.birthLocation,
        planets: chart.planets as Record<string, NatalPlanetPosition>,
      });
    }
    setEditingChart(chart);
  };

  const updatePlanet = (planet: string, field: keyof NatalPlanetPosition, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      planets: {
        ...prev.planets,
        [planet]: {
          ...prev.planets[planet],
          [field]: field === 'sign' ? value : Number(value) || 0,
        },
      },
    }));
  };

  const handleSave = () => {
    if (editingChart === 'user') {
      onSaveUserChart({
        id: 'user',
        ...formData,
      });
    } else if (editingChart === 'new') {
      onAddChart({
        id: '',
        ...formData,
      });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-5" onClick={() => setEditingChart(null)}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm bg-background p-8 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-light text-foreground">
                {editingChart === 'new' ? 'Add New Chart' : editingChart === 'user' ? 'Your Natal Chart' : 'Edit Chart'}
              </h2>
              <button onClick={() => setEditingChart(null)} className="text-muted-foreground hover:text-foreground">
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
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Birth Location</label>
                  <input
                    type="text"
                    value={formData.birthLocation}
                    onChange={e => setFormData({ ...formData, birthLocation: e.target.value })}
                    placeholder="City, Country"
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">Planet Positions</h3>
                <div className="space-y-3">
                  {PLANETS.map(planet => (
                    <div key={planet} className="grid grid-cols-[40px_100px_1fr_60px_60px_60px] gap-2 items-center">
                      <span className="text-lg">{getPlanetSymbol(planet.toLowerCase())}</span>
                      <span className="text-sm text-foreground">{planet}</span>
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
                      <input
                        type="number"
                        min="0"
                        max="29"
                        placeholder="Deg"
                        value={formData.planets[planet]?.degree || ''}
                        onChange={e => updatePlanet(planet, 'degree', e.target.value)}
                        className="border border-border bg-background px-2 py-1.5 text-sm text-center focus:border-primary focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Min"
                        value={formData.planets[planet]?.minutes || ''}
                        onChange={e => updatePlanet(planet, 'minutes', e.target.value)}
                        className="border border-border bg-background px-2 py-1.5 text-sm text-center focus:border-primary focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Sec"
                        value={formData.planets[planet]?.seconds || ''}
                        onChange={e => updatePlanet(planet, 'seconds', e.target.value)}
                        className="border border-border bg-background px-2 py-1.5 text-sm text-center focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setEditingChart(null)}
                  className="border border-border bg-transparent px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="border border-primary bg-primary px-5 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Save Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
