import { useState, useMemo, useRef } from 'react';
import { Sun, MapPin, ArrowRight, Compass, Star, Globe, ChevronDown, ChevronUp, Info, Upload, Loader2 } from 'lucide-react';
import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart, useSolarReturnChart } from '@/hooks/useSolarReturnChart';
import { analyzeSolarReturn, SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { ChartSelector } from './ChartSelector';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const CORE_PLANETS = ['Sun','Moon','Ascendant','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
const GODDESS_PLANETS = ['Chiron','Juno','Ceres','Pallas','Vesta','Lilith','Eris'] as const;
const ALL_INPUT_PLANETS = [...CORE_PLANETS, ...GODDESS_PLANETS] as const;

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇',
  Ascendant:'ASC', NorthNode:'☊', Chiron:'⚷',
  Juno:'⚵', Ceres:'⚳', Pallas:'⚴', Vesta:'🜕', Lilith:'⚸', Eris:'⯰',
};

const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const SolarReturnView = ({ userNatalChart, savedCharts }: Props) => {
  const allCharts = useMemo(() => [
    ...(userNatalChart ? [userNatalChart] : []),
    ...savedCharts,
  ], [userNatalChart, savedCharts]);

  const [selectedNatalId, setSelectedNatalId] = useState<string>(
    userNatalChart?.id || savedCharts[0]?.id || ''
  );

  const selectedNatal = allCharts.find(c => c.id === selectedNatalId) || allCharts[0] || null;

  const {
    solarReturnCharts, addSolarReturn, updateSolarReturn, deleteSolarReturn,
    getSolarReturnsForChart,
  } = useSolarReturnChart();

  const srChartsForNatal = selectedNatal ? getSolarReturnsForChart(selectedNatal.id) : [];

  const [selectedSRId, setSelectedSRId] = useState<string | null>(null);
  const selectedSR = srChartsForNatal.find(c => c.id === selectedSRId) || null;

  const [showInputForm, setShowInputForm] = useState(false);
  const [editingSRId, setEditingSRId] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!selectedSR || !selectedNatal) return null;
    return analyzeSolarReturn(selectedSR, selectedNatal);
  }, [selectedSR, selectedNatal]);

  if (!selectedNatal) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Sun size={48} className="mx-auto mb-4 opacity-30" />
        <p>Add a natal chart first to use Solar Return analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & chart picker */}
      <div className="flex flex-wrap items-center gap-4">
        <ChartSelector
          userNatalChart={userNatalChart}
          savedCharts={savedCharts}
          selectedChartId={selectedNatalId}
          onSelect={(id) => { setSelectedNatalId(id === 'user' ? (userNatalChart?.id || '') : id); setSelectedSRId(null); }}
          includeGeneral={false}
          label="Natal Chart:"
        />
      </div>

      {/* SR chart list */}
      <div className="border border-border rounded-sm p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm uppercase tracking-widest text-foreground font-medium">
            ☉ Solar Return Charts for {selectedNatal.name}
          </h3>
          <button
            onClick={() => { setShowInputForm(true); setEditingSRId(null); }}
            className="text-[11px] uppercase tracking-widest px-3 py-1.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
          >
            + Add SR Chart
          </button>
        </div>

        {srChartsForNatal.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Solar Return charts yet. Add one to see your yearly analysis.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {srChartsForNatal.sort((a, b) => b.solarReturnYear - a.solarReturnYear).map(sr => (
              <button
                key={sr.id}
                onClick={() => setSelectedSRId(sr.id)}
                className={`text-sm px-3 py-2 rounded-sm border transition-all ${
                  selectedSRId === sr.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border hover:border-primary'
                }`}
              >
                SR {sr.solarReturnYear}
                {sr.solarReturnLocation && sr.solarReturnLocation !== selectedNatal.birthLocation && (
                  <span className="ml-1 text-[10px] opacity-70">📍</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input form modal */}
      {showInputForm && (
        <SRInputForm
          natalChart={selectedNatal}
          existingSR={editingSRId ? srChartsForNatal.find(c => c.id === editingSRId) : undefined}
          onSave={(sr) => {
            if (editingSRId) {
              updateSolarReturn(editingSRId, sr);
            } else {
              const added = addSolarReturn({ ...sr, natalChartId: selectedNatal.id } as SolarReturnChart);
              setSelectedSRId(added.id);
            }
            setShowInputForm(false);
            setEditingSRId(null);
          }}
          onCancel={() => { setShowInputForm(false); setEditingSRId(null); }}
        />
      )}

      {/* Analysis */}
      {selectedSR && analysis && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-secondary p-1">
            <TabsTrigger value="overview" className="text-[11px] uppercase tracking-widest">Overview</TabsTrigger>
            <TabsTrigger value="houses" className="text-[11px] uppercase tracking-widest">House Overlay</TabsTrigger>
            <TabsTrigger value="aspects" className="text-[11px] uppercase tracking-widest">Aspects</TabsTrigger>
            <TabsTrigger value="relocation" className="text-[11px] uppercase tracking-widest">Relocation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} onEdit={() => { setEditingSRId(selectedSR.id); setShowInputForm(true); }} onDelete={() => { deleteSolarReturn(selectedSR.id); setSelectedSRId(null); }} />
          </TabsContent>

          <TabsContent value="houses">
            <HouseOverlayTab analysis={analysis} />
          </TabsContent>

          <TabsContent value="aspects">
            <AspectsTab analysis={analysis} />
          </TabsContent>

          <TabsContent value="relocation">
            <RelocationTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// ─── SR Input Form ──────────────────────────────────────────────────

interface SRInputFormProps {
  natalChart: NatalChart;
  existingSR?: SolarReturnChart;
  onSave: (sr: Partial<SolarReturnChart>) => void;
  onCancel: () => void;
}

const SRInputForm = ({ natalChart, existingSR, onSave, onCancel }: SRInputFormProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(existingSR?.solarReturnYear || currentYear);
  const [location, setLocation] = useState(existingSR?.solarReturnLocation || natalChart.birthLocation || '');
  const [srDateTime, setSrDateTime] = useState(existingSR?.solarReturnDateTime || '');
  const [planets, setPlanets] = useState<Record<string, { sign: string; degree: number; minutes: number; isRetrograde?: boolean }>>(
    existingSR?.planets ? { ...existingSR.planets } as any : {}
  );
  const [houseCusps, setHouseCusps] = useState<Record<string, { sign: string; degree: number; minutes: number }>>(
    existingSR?.houseCusps ? { ...existingSR.houseCusps } as any : {}
  );
  const [showHouses, setShowHouses] = useState(false);
  const [showGoddess, setShowGoddess] = useState(
    // Auto-expand if any goddess planets already have data
    GODDESS_PLANETS.some(p => (existingSR?.planets as any)?.[p]?.sign)
  );

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePlanet = (name: string, field: string, value: any) => {
    setPlanets(prev => ({
      ...prev,
      [name]: { ...prev[name], sign: prev[name]?.sign || 'Aries', degree: prev[name]?.degree || 0, minutes: prev[name]?.minutes || 0, [field]: value }
    }));
  };

  const updateHouse = (num: number, field: string, value: any) => {
    const key = `house${num}`;
    setHouseCusps(prev => ({
      ...prev,
      [key]: { ...prev[key], sign: prev[key]?.sign || 'Aries', degree: prev[key]?.degree || 0, minutes: prev[key]?.minutes || 0, [field]: value }
    }));
  };

  // ─── File upload / drag-and-drop ──────────────────────────────────
  const processFile = async (file: File) => {
    setUploadStatus('uploading');
    setUploadError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;

      setUploadStatus('parsing');

      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      const isWord = fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc');

      const { data, error } = await supabase.functions.invoke('parse-chart-image', {
        body: {
          imageBase64: fileBase64,
          fileType: isPDF ? 'pdf' : isWord ? 'word' : 'image',
          fileName: file.name,
        },
      });

      if (error) throw new Error(error.message || 'Failed to parse file');
      if (!data?.data) throw new Error('No chart data found in file.');

      const parsedData = data.data;
      let planetsImported = 0;
      let housesImported = 0;

      // Import planets
      if (parsedData.planets && typeof parsedData.planets === 'object') {
        const newPlanets: Record<string, any> = { ...planets };
        for (const [planet, position] of Object.entries(parsedData.planets)) {
          const pos = position as any;
          if (pos?.sign && ZODIAC_SIGNS.includes(pos.sign)) {
            newPlanets[planet] = {
              sign: pos.sign,
              degree: typeof pos.degree === 'number' ? pos.degree : 0,
              minutes: typeof pos.minutes === 'number' ? pos.minutes : 0,
              isRetrograde: pos.isRetrograde === true,
            };
            planetsImported++;
          }
        }
        setPlanets(newPlanets);
      }

      // Import house cusps
      if (parsedData.houseCusps && typeof parsedData.houseCusps === 'object') {
        const newCusps: Record<string, any> = { ...houseCusps };
        for (let i = 1; i <= 12; i++) {
          const key = `house${i}`;
          const cusp = parsedData.houseCusps[key];
          if (cusp?.sign && ZODIAC_SIGNS.includes(cusp.sign)) {
            newCusps[key] = {
              sign: cusp.sign,
              degree: typeof cusp.degree === 'number' ? cusp.degree : 0,
              minutes: typeof cusp.minutes === 'number' ? cusp.minutes : 0,
            };
            housesImported++;
          }
        }
        setHouseCusps(newCusps);
        if (housesImported > 0) setShowHouses(true);
      }

      // Auto-expand goddess section if we got any
      if (GODDESS_PLANETS.some(p => parsedData.planets?.[p]?.sign)) {
        setShowGoddess(true);
      }

      setUploadStatus('idle');
      toast.success(`Imported ${planetsImported} planets${housesImported > 0 ? ` and ${housesImported} house cusps` : ''}`);
    } catch (err: any) {
      setUploadStatus('idle');
      setUploadError(err.message || 'Upload failed');
      toast.error(err.message || 'Failed to parse chart');
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!planets.Sun?.sign) return;
    onSave({
      name: `SR ${year} – ${natalChart.name}`,
      birthDate: natalChart.birthDate,
      birthTime: srDateTime || natalChart.birthTime,
      birthLocation: location,
      solarReturnYear: year,
      solarReturnLocation: location,
      solarReturnDateTime: srDateTime,
      planets: planets as any,
      houseCusps: Object.keys(houseCusps).length > 0 ? houseCusps as any : undefined,
    });
  };

  const renderPlanetRow = (planet: string) => (
    <div key={planet} className="flex items-center gap-2 bg-secondary/30 rounded-sm p-2">
      <span className="w-8 text-center text-sm">{PLANET_SYMBOLS[planet] || planet.slice(0, 3)}</span>
      <span className="w-20 text-xs text-muted-foreground truncate">{planet}</span>
      <select
        value={planets[planet]?.sign || ''}
        onChange={(e) => updatePlanet(planet, 'sign', e.target.value)}
        className="flex-1 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs"
      >
        <option value="">—</option>
        {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{SIGN_SYMBOLS[s]} {s}</option>)}
      </select>
      <input
        type="number" min={0} max={29}
        value={planets[planet]?.degree ?? ''}
        onChange={(e) => updatePlanet(planet, 'degree', parseInt(e.target.value) || 0)}
        placeholder="°"
        className="w-12 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs text-center"
      />
      <input
        type="number" min={0} max={59}
        value={planets[planet]?.minutes ?? ''}
        onChange={(e) => updatePlanet(planet, 'minutes', parseInt(e.target.value) || 0)}
        placeholder="'"
        className="w-12 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs text-center"
      />
      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <input
          type="checkbox"
          checked={planets[planet]?.isRetrograde || false}
          onChange={(e) => updatePlanet(planet, 'isRetrograde', e.target.checked)}
        />
        Rx
      </label>
    </div>
  );

  return (
    <div className="border border-primary/30 rounded-sm p-5 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">
          {existingSR ? 'Edit' : 'Add'} Solar Return Chart
        </h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-sm">
        <Info size={14} className="inline mr-1" />
        Enter your Solar Return chart data from astro.com or your preferred astrology software, or drag & drop a chart image below.
      </div>

      {/* Drag & Drop Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
        />
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center w-full min-h-[120px]
            border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/10 scale-[1.01]' 
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
            }
            ${uploadStatus !== 'idle' ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {uploadStatus !== 'idle' ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm font-medium">
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Reading chart data...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <div className={`p-3 rounded-full transition-colors ${isDragOver ? 'bg-primary/20' : 'bg-muted'}`}>
                <Upload size={24} className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? 'Drop your chart here' : 'Drag & drop your SR chart image'}
              </p>
              <p className="text-xs text-muted-foreground">or click to browse • PNG, JPG, PDF, DOCX</p>
            </div>
          )}
        </label>
        {uploadError && (
          <p className="text-xs text-destructive mt-1">{uploadError}</p>
        )}
      </div>

      {/* Person info (from natal chart) + SR details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
          <div className="w-full border border-border bg-muted text-foreground rounded-sm px-3 py-2 text-sm opacity-80">
            {natalChart.name || '—'}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Birthday</label>
          <div className="w-full border border-border bg-muted text-foreground rounded-sm px-3 py-2 text-sm opacity-80">
            {natalChart.birthDate || '—'}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">SR Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">SR Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country (if relocated)"
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Core planet positions */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Planet Positions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CORE_PLANETS.map(renderPlanetRow)}
        </div>
      </div>

      {/* Goddess Planets & Chiron (collapsible) */}
      <div>
        <button
          onClick={() => setShowGoddess(!showGoddess)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          {showGoddess ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Chiron & Goddess Asteroids
        </button>
        {showGoddess && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {GODDESS_PLANETS.map(renderPlanetRow)}
          </div>
        )}
      </div>

      {/* House cusps (collapsible) */}
      <div>
        <button
          onClick={() => setShowHouses(!showHouses)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          {showHouses ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          House Cusps (Optional but recommended)
        </button>
        {showHouses && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <div key={num} className="flex items-center gap-2 bg-secondary/30 rounded-sm p-2">
                <span className="w-12 text-xs font-medium text-muted-foreground">House {num}</span>
                <select
                  value={houseCusps[`house${num}`]?.sign || ''}
                  onChange={(e) => updateHouse(num, 'sign', e.target.value)}
                  className="flex-1 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs"
                >
                  <option value="">—</option>
                  {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{SIGN_SYMBOLS[s]} {s}</option>)}
                </select>
                <input
                  type="number" min={0} max={29}
                  value={houseCusps[`house${num}`]?.degree ?? ''}
                  onChange={(e) => updateHouse(num, 'degree', parseInt(e.target.value) || 0)}
                  placeholder="°"
                  className="w-12 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs text-center"
                />
                <input
                  type="number" min={0} max={59}
                  value={houseCusps[`house${num}`]?.minutes ?? ''}
                  onChange={(e) => updateHouse(num, 'minutes', parseInt(e.target.value) || 0)}
                  placeholder="'"
                  className="w-12 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs text-center"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs px-4 py-2 border border-border rounded-sm text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          onClick={handleSave}
          disabled={!planets.Sun?.sign}
          className="text-xs px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-40"
        >
          {existingSR ? 'Update' : 'Save'} Solar Return
        </button>
      </div>
    </div>
  );
};

// ─── Overview Tab ───────────────────────────────────────────────────

const ALL_DISPLAY_PLANETS = [...CORE_PLANETS, ...GODDESS_PLANETS] as const;

const OverviewTab = ({ analysis, srChart, natalChart, onEdit, onDelete }: {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="space-y-4 mt-4">
      {/* Year Theme */}
      {analysis.yearlyTheme && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
            <Sun size={16} className="text-primary" />
            Year Theme — SR {srChart.solarReturnYear}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{SIGN_SYMBOLS[analysis.yearlyTheme.ascendantSign] || ''}</span>
            <div>
              <p className="text-lg font-serif text-foreground">{analysis.yearlyTheme.ascendantSign} Rising</p>
              <p className="text-xs text-muted-foreground">
                Ruled by {analysis.yearlyTheme.ascendantRuler} in {analysis.yearlyTheme.ascendantRulerSign}
                {analysis.yearlyTheme.ascendantRulerHouse && ` (${analysis.yearlyTheme.ascendantRulerHouse}th house)`}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.yearlyTheme.yearTheme}</p>
        </div>
      )}

      {/* Sun & Moon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">☉ Sun's Focus This Year</h4>
          {analysis.sunHouse.house ? (
            <>
              <p className="text-lg font-serif text-foreground">{analysis.sunHouse.house}th House</p>
              <p className="text-xs text-muted-foreground">{analysis.sunHouse.theme}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your vitality and core identity are directed toward {analysis.sunHouse.theme.toLowerCase()} themes this year.
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Add house cusps to the natal chart to see house overlay.</p>
          )}
        </div>
        <div className="border border-border rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">☽ Emotional Climate</h4>
          <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[analysis.moonSign]} Moon in {analysis.moonSign}</p>
          {analysis.moonHouse.house && (
            <p className="text-xs text-muted-foreground">{analysis.moonHouse.house}th House — {analysis.moonHouse.theme}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Your emotional needs and instinctive responses this year are filtered through {analysis.moonSign} energy.
          </p>
        </div>
      </div>

      {/* Angular Planets */}
      {analysis.angularPlanets.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">⚡ Angular Planets (High Impact)</h4>
          <p className="text-sm text-muted-foreground mb-2">
            These planets are near the SR Ascendant or MC — they dominate the year:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.angularPlanets.map(p => (
              <span key={p} className="px-3 py-1 bg-primary/10 text-primary rounded-sm text-sm font-medium">
                {PLANET_SYMBOLS[p] || p.slice(0, 3)} {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SR planet positions summary */}
      <div className="border border-border rounded-sm p-4 bg-card">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SR Chart Positions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {ALL_DISPLAY_PLANETS.map(planet => {
            const pos = srChart.planets[planet as keyof typeof srChart.planets];
            if (!pos) return null;
            return (
              <div key={planet} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-6 text-center">{PLANET_SYMBOLS[planet] || planet.slice(0, 2)}</span>
                <span className="text-foreground">{SIGN_SYMBOLS[pos.sign]} {pos.degree}°{pos.minutes}'</span>
                {pos.isRetrograde && <span className="text-[10px] text-destructive">Rx</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground">
          Edit SR Chart
        </button>
        <button onClick={onDelete} className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-destructive/30 rounded-sm text-destructive hover:bg-destructive/10">
          Delete
        </button>
      </div>
    </div>
  );
};

// ─── House Overlay Tab ──────────────────────────────────────────────

const HouseOverlayTab = ({ analysis }: { analysis: SolarReturnAnalysis }) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-sm">
        <Info size={14} className="inline mr-1" />
        This shows where your Solar Return planets fall in your <strong>natal</strong> houses — revealing which life areas are activated this year.
      </div>

      {analysis.houseOverlays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add house cusps to the natal chart to see house overlays.</p>
      ) : (
        <div className="space-y-2">
          {analysis.houseOverlays.map((overlay, i) => (
            <div key={i} className="border border-border rounded-sm p-3 bg-card flex items-start gap-3">
              <span className="text-lg w-8 text-center">{PLANET_SYMBOLS[overlay.planet] || overlay.planet.slice(0, 2)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{overlay.planet}</span>
                  <span className="text-xs text-muted-foreground">
                    {SIGN_SYMBOLS[overlay.srSign]} {overlay.srSign} {overlay.srDegree}
                  </span>
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <span className="text-sm text-primary font-medium">
                    Natal {overlay.natalHouse ? `${overlay.natalHouse}th House` : '—'}
                  </span>
                </div>
                {overlay.houseTheme && (
                  <p className="text-xs text-muted-foreground mt-1">{overlay.houseTheme}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Aspects Tab ────────────────────────────────────────────────────

const aspectColor = (type: string): string => {
  switch (type) {
    case 'Conjunction': return 'text-primary';
    case 'Trine': case 'Sextile': return 'text-green-500';
    case 'Square': case 'Opposition': return 'text-red-400';
    default: return 'text-muted-foreground';
  }
};

const AspectsTab = ({ analysis }: { analysis: SolarReturnAnalysis }) => {
  return (
    <div className="space-y-6 mt-4">
      {/* SR to Natal */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SR Planets → Natal Chart Aspects</h4>
        {analysis.srToNatalAspects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No major aspects detected.</p>
        ) : (
          <div className="space-y-2">
            {analysis.srToNatalAspects.slice(0, 20).map((asp, i) => (
              <div key={i} className="border border-border rounded-sm p-3 bg-card">
                <div className="flex items-center gap-2 text-sm">
                  <span>{PLANET_SYMBOLS[asp.planet1] || asp.planet1.slice(0, 3)} SR {asp.planet1}</span>
                  <span className={`font-medium ${aspectColor(asp.type)}`}>{asp.type}</span>
                  <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2.slice(0, 3)} Natal {asp.planet2}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{asp.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SR internal */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SR Internal Aspects</h4>
        {analysis.srInternalAspects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No major internal aspects.</p>
        ) : (
          <div className="space-y-2">
            {analysis.srInternalAspects.slice(0, 15).map((asp, i) => (
              <div key={i} className="border border-border rounded-sm p-3 bg-card">
                <div className="flex items-center gap-2 text-sm">
                  <span>{PLANET_SYMBOLS[asp.planet1] || asp.planet1.slice(0, 3)} {asp.planet1}</span>
                  <span className={`font-medium ${aspectColor(asp.type)}`}>{asp.type}</span>
                  <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2.slice(0, 3)} {asp.planet2}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{asp.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Relocation Tab ─────────────────────────────────────────────────

const RelocationTab = ({ analysis, srChart, natalChart }: {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="border border-primary/20 rounded-sm p-5 bg-card">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
          <Globe size={16} className="text-primary" />
          Solar Return Relocation
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.relocationTip}</p>
      </div>

      <div className="border border-border rounded-sm p-5 bg-card space-y-3">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">How It Works</h4>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Your Solar Return chart is cast for the <strong>exact moment</strong> the transiting Sun returns to your natal Sun's degree — the location determines the rising sign and house cusps.</li>
          <li>By traveling to a different city for your birthday, you change the SR Ascendant, MC, and house placements of all SR planets.</li>
          <li>The planet positions (sign and degree) stay the same — only the houses change.</li>
          <li><strong>Strategy:</strong> Look for locations that place Jupiter or Venus on the SR Ascendant or MC, and avoid Saturn/Pluto on angles unless you want a year of deep transformation.</li>
          <li>You only need to be at the location at the <em>exact</em> moment of the solar return — not necessarily on your calendar birthday.</li>
        </ul>
      </div>

      <div className="border border-border rounded-sm p-5 bg-card space-y-3">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">What to Look For in Your SR Chart</h4>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>SR Ascendant sign:</strong> Sets the overall tone and approach for the year</li>
          <li><strong>Chart ruler placement:</strong> Where the ruler of the SR Ascendant falls shows the year's primary focus</li>
          <li><strong>Planets on angles:</strong> Any planet within 5–8° of the ASC/MC/DSC/IC becomes a dominant force</li>
          <li><strong>SR Moon:</strong> Shows your emotional needs and what feels most important this year</li>
          <li><strong>SR Sun's house:</strong> Since the Sun is always at the same degree, its <em>house</em> shows where your vitality is directed</li>
          <li><strong>SR planets in natal houses:</strong> Reveals which natal life areas are activated</li>
          <li><strong>SR-to-Natal aspects:</strong> Tight aspects between SR and natal planets highlight key themes</li>
        </ul>
      </div>

      {srChart.solarReturnLocation && srChart.solarReturnLocation !== natalChart.birthLocation && (
        <div className="border border-border rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            📍 This SR chart was relocated
          </h4>
          <p className="text-sm text-muted-foreground">
            Birth location: <strong>{natalChart.birthLocation}</strong> → SR location: <strong>{srChart.solarReturnLocation}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            To compare, add another SR chart for the same year using your birth location.
          </p>
        </div>
      )}
    </div>
  );
};
