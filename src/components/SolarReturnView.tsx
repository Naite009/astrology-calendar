import { useState, useMemo, useRef } from 'react';
import { Sun, MapPin, ArrowRight, Compass, Star, Globe, ChevronDown, ChevronUp, Info, Upload, Loader2, Moon, Flame, Droplets, Wind, Mountain, RotateCcw, Repeat, Layers, Target, Sparkles, Zap } from 'lucide-react';
import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart, useSolarReturnChart } from '@/hooks/useSolarReturnChart';
import { analyzeSolarReturn, SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { srSunInHouse, srMoonInHouse, srMoonInSign, srOverlayNarrative, srPlanetInHouse, rulerConditionNarrative, angularPlanetMeaning } from '@/lib/solarReturnInterpretations';
import { srMoonInHouseDeep, srMoonPhaseInterp, srMoonAngularity, srMoonAspects } from '@/lib/solarReturnMoonData';
import { vertexInSign, vertexInHouse, vertexAspectMeanings } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep, type SRPlanetHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, aspectTypeMeanings, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentExcerpts } from '@/hooks/useDocumentExcerpts';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { SolarReturnPDFExport } from '@/components/SolarReturnPDFExport';

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const CORE_PLANETS = ['Sun','Moon','Ascendant','NorthNode','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
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

  const {
    solarReturnCharts, addSolarReturn, updateSolarReturn, deleteSolarReturn,
    getSolarReturnsForChart,
  } = useSolarReturnChart();

  // Only show natal charts that have at least one SR chart uploaded
  const natalChartsWithSR = useMemo(() => {
    return allCharts.filter(c => getSolarReturnsForChart(c.id).length > 0);
  }, [allCharts, solarReturnCharts]);

  const [selectedNatalId, setSelectedNatalId] = useState<string>(
    natalChartsWithSR[0]?.id || userNatalChart?.id || savedCharts[0]?.id || ''
  );

  // For adding a new SR, we need access to all natal charts
  const [showAddForNewPerson, setShowAddForNewPerson] = useState(false);

  const selectedNatal = allCharts.find(c => c.id === selectedNatalId) || allCharts[0] || null;

  const srChartsForNatal = selectedNatal ? getSolarReturnsForChart(selectedNatal.id) : [];

  const [selectedSRId, setSelectedSRId] = useState<string | null>(null);
  const selectedSR = srChartsForNatal.find(c => c.id === selectedSRId) || null;

  const [showInputForm, setShowInputForm] = useState(false);
  const [editingSRId, setEditingSRId] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!selectedSR || !selectedNatal) return null;
    return analyzeSolarReturn(selectedSR, selectedNatal);
  }, [selectedSR, selectedNatal]);

  if (!allCharts.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Sun size={48} className="mx-auto mb-4 opacity-30" />
        <p>Add a natal chart first to use Solar Return analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Educational intro */}
      <div className="border border-border rounded-sm p-5 bg-card/60 space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-foreground font-medium flex items-center gap-2">
          <Sun size={16} className="text-primary" /> Your Solar Return
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A Solar Return chart is cast for the exact moment the Sun returns to its natal degree each year — your cosmic birthday blueprint.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2 text-[13px] text-foreground/80">
          <li className="flex items-start gap-2">
            <Compass size={14} className="mt-0.5 text-primary shrink-0" />
            <span>Understand how to <strong>execute</strong> a Solar Return — the directives to lean into for your year ahead</span>
          </li>
          <li className="flex items-start gap-2">
            <Star size={14} className="mt-0.5 text-primary shrink-0" />
            <span>Discover key elements to look for and how to <strong>blend it with your natal chart</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <Globe size={14} className="mt-0.5 text-primary shrink-0" />
            <span>Learn <strong>where to travel</strong> on your birthday to craft the Solar Return chart you want</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight size={14} className="mt-0.5 text-primary shrink-0" />
            <span>Add a new level of understanding to <strong>your current cycle</strong> and how the planets support your growth</span>
          </li>
        </ul>
      </div>

      {/* Header & person picker — only people with SR charts, plus option to add new */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Solar Return:</label>
        {natalChartsWithSR.length > 0 ? (
          <select
            value={selectedNatalId}
            onChange={(e) => { setSelectedNatalId(e.target.value); setSelectedSRId(null); }}
            className="border border-border bg-background text-foreground rounded-sm px-3 py-1.5 text-sm"
          >
            {natalChartsWithSR.map(c => (
              <option key={c.id} value={c.id}>
                {c.id === userNatalChart?.id ? `★ ${c.name}` : c.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-muted-foreground">No Solar Return charts yet</span>
        )}
        <button
          onClick={() => { setShowAddForNewPerson(!showAddForNewPerson); }}
          className="text-[11px] uppercase tracking-widest px-3 py-1.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          + Add SR Chart
        </button>
      </div>

      {/* When adding for potentially a different person, show natal chart picker */}
      {showAddForNewPerson && !showInputForm && (
        <div className="border border-primary/30 rounded-sm p-4 bg-card space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Select person for new Solar Return:</h4>
          <div className="flex flex-wrap gap-2">
            {allCharts.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedNatalId(c.id);
                  setShowInputForm(true);
                  setEditingSRId(null);
                  setShowAddForNewPerson(false);
                }}
                className="text-sm px-3 py-2 rounded-sm border border-border bg-secondary text-foreground hover:border-primary transition-all"
              >
                {c.id === userNatalChart?.id ? `★ ${c.name}` : c.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddForNewPerson(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      )}

      {/* SR chart list for selected person */}
      {srChartsForNatal.length > 0 && (
        <div className="border border-border rounded-sm p-4 bg-card">
          <h3 className="text-sm uppercase tracking-widest text-foreground font-medium mb-3">
            ☉ Solar Return Charts for {selectedNatal.name}
          </h3>
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
                {sr.solarReturnLocation && sr.solarReturnLocation !== selectedNatal?.birthLocation && (
                  <span className="ml-1 text-[10px] opacity-70">📍</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
        reader.onerror = (err) => reject(new Error('Failed to read file'));
      });
      reader.readAsDataURL(file);
      let fileBase64: string;
      try {
        fileBase64 = await base64Promise;
      } catch {
        setUploadStatus('idle');
        setUploadError('Could not read file');
        return;
      }

      setUploadStatus('parsing');

      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      const isWord = fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc');

      let data: any;
      let error: any;
      try {
        const result = await supabase.functions.invoke('parse-chart-image', {
          body: {
            imageBase64: fileBase64,
            fileType: isPDF ? 'pdf' : isWord ? 'word' : 'image',
            fileName: file.name,
          },
        });
        data = result.data;
        error = result.error;
      } catch (fetchErr: any) {
        setUploadStatus('idle');
        setUploadError(fetchErr.message || 'Network error during parsing');
        toast.error('Network error during chart parsing');
        return;
      }

      if (error) {
        setUploadStatus('idle');
        setUploadError(error.message || 'Failed to parse file');
        toast.error(error.message || 'Failed to parse file');
        return;
      }
      if (!data?.data) {
        setUploadStatus('idle');
        setUploadError('No chart data found in file.');
        toast.error('No chart data found. Try a clearer image.');
        return;
      }

      const parsedData = data.data;
      let planetsImported = 0;
      let housesImported = 0;

      // Extract SR-specific info
      const birthInfo = parsedData.birthInfo;
      if (birthInfo) {
        // For SR charts, the location shown IS the SR location
        // Check multiple possible location fields from the parser
        const srLoc = birthInfo.birthLocation || birthInfo.location || birthInfo.city;
        if (srLoc && typeof srLoc === 'string' && srLoc.trim().length > 0) {
          setLocation(srLoc.trim());
        }
        // Try progressionDate first (SR chart date), fallback to birthDate year
        const srDateStr = birthInfo.progressionDate || birthInfo.birthDate;
        if (srDateStr && /^\d{4}/.test(srDateStr)) {
          const parsedYear = parseInt(srDateStr.slice(0, 4), 10);
          if (parsedYear > 1900 && parsedYear < 2100) setYear(parsedYear);
        }
      }

      // Also check top-level location fields from parser output
      const topLevelLoc = parsedData.solarReturnLocation || parsedData.location;
      if (topLevelLoc && typeof topLevelLoc === 'string' && topLevelLoc.trim().length > 0) {
        setLocation(topLevelLoc.trim());
      }

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
      console.error('[SR Upload] Unexpected error:', err);
      setUploadStatus('idle');
      setUploadError(err?.message || 'Upload failed');
      toast.error(err?.message || 'Failed to parse chart');
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
          {/* Chart ruler condition */}
          {analysis.lordOfTheYear && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Chart Ruler Condition:</strong> {rulerConditionNarrative(analysis.lordOfTheYear.dignity, analysis.lordOfTheYear.isRetrograde)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SR Ascendant Ruler in Natal Houses — the J-B Morin technique */}
      {analysis.srAscRulerInNatal && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
            <Compass size={16} className="text-primary" />
            Where This Year Plays Out in YOUR Life
          </h3>

          {/* Step-by-step logic so it's crystal clear */}
          <div className="bg-secondary/50 rounded-sm p-3 mb-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">How this works (J-B Morin / Lynn Bell technique):</p>
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Step 1:</span> Your Solar Return Ascendant is {SIGN_SYMBOLS[analysis.srAscRulerInNatal.srAscSign] || ''} <strong>{analysis.srAscRulerInNatal.srAscSign}</strong> Rising
            </p>
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Step 2:</span> {analysis.srAscRulerInNatal.srAscSign} is ruled by <strong>{PLANET_SYMBOLS[analysis.srAscRulerInNatal.rulerPlanet]} {analysis.srAscRulerInNatal.rulerPlanet}</strong> — this planet drives the entire year
            </p>
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Step 3:</span> We look at where {analysis.srAscRulerInNatal.rulerPlanet} sits <em>in your birth chart</em> (not the SR chart)
            </p>
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Result:</span> Your <strong>natal</strong> {PLANET_SYMBOLS[analysis.srAscRulerInNatal.rulerPlanet]} {analysis.srAscRulerInNatal.rulerPlanet} is in{' '}
              {analysis.srAscRulerInNatal.rulerNatalSign ? <><strong>{SIGN_SYMBOLS[analysis.srAscRulerInNatal.rulerNatalSign] || ''} {analysis.srAscRulerInNatal.rulerNatalSign}</strong></> : '—'}{' '}
              {analysis.srAscRulerInNatal.rulerNatalHouse && <>in your <strong>natal {analysis.srAscRulerInNatal.rulerNatalHouse}{analysis.srAscRulerInNatal.rulerNatalHouse === 1 ? 'st' : analysis.srAscRulerInNatal.rulerNatalHouse === 2 ? 'nd' : analysis.srAscRulerInNatal.rulerNatalHouse === 3 ? 'rd' : 'th'} house</strong></>}
            </p>
          </div>

          {/* The key insight */}
          {analysis.srAscRulerInNatal.rulerNatalHouse && (
            <div className="bg-primary/5 border border-primary/10 rounded-sm p-3 mb-3">
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1">
                The year plays out in your natal {analysis.srAscRulerInNatal.rulerNatalHouse}{analysis.srAscRulerInNatal.rulerNatalHouse === 1 ? 'st' : analysis.srAscRulerInNatal.rulerNatalHouse === 2 ? 'nd' : analysis.srAscRulerInNatal.rulerNatalHouse === 3 ? 'rd' : 'th'} House — {analysis.srAscRulerInNatal.rulerNatalHouseTheme}
              </p>
            </div>
          )}

          {/* SR position noted separately for context */}
          <p className="text-[10px] text-muted-foreground mb-3">
            (For reference: in this year's SR chart, {analysis.srAscRulerInNatal.rulerPlanet} is currently transiting {SIGN_SYMBOLS[analysis.srAscRulerInNatal.rulerSRSign] || ''} {analysis.srAscRulerInNatal.rulerSRSign}
            {analysis.srAscRulerInNatal.rulerSRHouse ? ` in SR House ${analysis.srAscRulerInNatal.rulerSRHouse}` : ''} — but for this technique, we use the natal position.)
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.srAscRulerInNatal.interpretation}</p>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Source: J-B Morin, Lynn Bell ("Planetary Threads"), Mel Priestley, Elena Lumen
          </p>
        </div>
      )}

      {/* Lord of the Year */}
      {analysis.lordOfTheYear && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">
            Lord of the Year — {PLANET_SYMBOLS[analysis.lordOfTheYear.planet] || ''} {analysis.lordOfTheYear.planet} in SR {analysis.lordOfTheYear.srHouse ? `${analysis.lordOfTheYear.srHouse}th House` : '—'}
          </h3>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-2xl">{PLANET_SYMBOLS[analysis.lordOfTheYear.planet] || analysis.lordOfTheYear.planet}</span>
            <span className="text-sm text-foreground">
              {SIGN_SYMBOLS[analysis.lordOfTheYear.srSign]} {analysis.lordOfTheYear.srSign} {analysis.lordOfTheYear.srDegree}
            </span>
            {analysis.lordOfTheYear.isRetrograde && <span className="text-[10px] text-destructive font-medium">Rx</span>}
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${
              analysis.lordOfTheYear.dignity === 'Domicile' || analysis.lordOfTheYear.dignity === 'Exaltation'
                ? 'bg-green-500/10 text-green-600'
                : analysis.lordOfTheYear.dignity === 'Detriment' || analysis.lordOfTheYear.dignity === 'Fall'
                  ? 'bg-red-400/10 text-red-400'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {analysis.lordOfTheYear.dignity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.lordOfTheYear.interpretation}</p>
          <p className="text-[10px] text-muted-foreground mt-2">
            This is your natal {analysis.lordOfTheYear.natalRisingSign} ruler — its SR placement shows where your core self is operating this year.
          </p>
        </div>
      )}

      {/* Annual Profection */}
      {analysis.profectionYear && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">
            Profection Year — House {analysis.profectionYear.houseNumber} / Time Lord: {PLANET_SYMBOLS[analysis.profectionYear.timeLord] || ''} {analysis.profectionYear.timeLord}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            Age at this Solar Return: <span className="font-medium text-foreground">{analysis.profectionYear.age}</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.profectionYear.interpretation}</p>
          {analysis.profectionYear.overlap && (
            <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-sm">
              <p className="text-xs text-primary font-medium">⚡ Confirmed theme — this planet appears in multiple timing systems. High certainty.</p>
            </div>
          )}

          {/* Profection Wheel */}
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Annual Profection Wheel</p>
            <div className="flex justify-center">
               <svg viewBox="0 0 500 500" className="w-full max-w-[520px]">
                {Array.from({ length: 12 }, (_, i) => {
                  const houseNum = i + 1;
                  const isActive = houseNum === analysis.profectionYear!.houseNumber;
                  const startAngle = 180 - i * 30;
                  const endAngle = startAngle - 30;
                  const midAngle = (startAngle + endAngle) / 2;
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const cx = 250, cy = 250, r = 210, rInner = 90;
                  const x1 = cx + r * Math.cos(toRad(startAngle));
                  const y1 = cy - r * Math.sin(toRad(startAngle));
                  const x2 = cx + r * Math.cos(toRad(endAngle));
                  const y2 = cy - r * Math.sin(toRad(endAngle));
                  const x3 = cx + rInner * Math.cos(toRad(endAngle));
                  const y3 = cy - rInner * Math.sin(toRad(endAngle));
                  const x4 = cx + rInner * Math.cos(toRad(startAngle));
                  const y4 = cy - rInner * Math.sin(toRad(startAngle));
                  const baseAge = houseNum - 1;
                  const allAges = Array.from({ length: 9 }, (_, j) => baseAge + j * 12).filter(a => a <= 99);
                  // Position house label near outer edge, ages near middle
                  const houseLabelR = r - 18;
                  const hlx = cx + houseLabelR * Math.cos(toRad(midAngle));
                  const hly = cy - houseLabelR * Math.sin(toRad(midAngle));
                  // Ages in two rows in the middle band
                  const agesR1 = (r + rInner) / 2 + 12;
                  const agesR2 = (r + rInner) / 2 - 12;
                  const a1x = cx + agesR1 * Math.cos(toRad(midAngle));
                  const a1y = cy - agesR1 * Math.sin(toRad(midAngle));
                  const a2x = cx + agesR2 * Math.cos(toRad(midAngle));
                  const a2y = cy - agesR2 * Math.sin(toRad(midAngle));
                  const row1 = allAges.slice(0, 5);
                  const row2 = allAges.slice(5);

                  const path = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
                  const currentAge = analysis.profectionYear!.age;
                  const hasCurrentAge = allAges.includes(currentAge);
                  return (
                    <g key={i}>
                      <path
                        d={path}
                        fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        opacity={isActive ? 1 : 0.5}
                      />
                      {/* House number near outer ring */}
                      <text x={hlx} y={hly} textAnchor="middle" dominantBaseline="middle"
                        fontSize="11" fontWeight="bold"
                        fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}>
                        H{houseNum}
                      </text>
                      {/* Ages row 1 */}
                      <text x={a1x} y={a1y} textAnchor="middle" dominantBaseline="middle"
                        fontSize="8"
                        fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}>
                        {row1.map(a => a === currentAge ? `[${a}]` : a).join(' ')}
                      </text>
                      {/* Ages row 2 */}
                      {row2.length > 0 && (
                        <text x={a2x} y={a2y} textAnchor="middle" dominantBaseline="middle"
                          fontSize="8"
                          fill={isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}>
                          {row2.map(a => a === currentAge ? `[${a}]` : a).join(' ')}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* Center label */}
                <text x="250" y="240" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">
                  Age {analysis.profectionYear!.age}
                </text>
                <text x="250" y="260" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                  {analysis.profectionYear!.houseNumber}{analysis.profectionYear!.houseNumber === 1 ? 'st' : analysis.profectionYear!.houseNumber === 2 ? 'nd' : analysis.profectionYear!.houseNumber === 3 ? 'rd' : 'th'} House Year
                </text>
              </svg>
            </div>
          </div>

          {/* Profection Age Table — All ages 0-99 */}
          <details className="mt-4">
            <summary className="text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Full Profection Table (Ages 0–99)
            </summary>
            <div className="mt-2 max-h-64 overflow-y-auto border border-border rounded-sm">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Age</th>
                    <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">House</th>
                    <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">Theme</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 100 }, (_, age) => {
                    const house = (age % 12) + 1;
                    const isCurrentAge = age === analysis.profectionYear!.age;
                    const themes: Record<number, string> = {
                      1: 'Self, identity, new beginnings',
                      2: 'Finances, values, self-worth',
                      3: 'Communication, siblings, learning',
                      4: 'Home, family, roots',
                      5: 'Creativity, romance, children',
                      6: 'Health, daily routines, service',
                      7: 'Partnerships, marriage, contracts',
                      8: 'Transformation, shared resources',
                      9: 'Travel, higher learning, philosophy',
                      10: 'Career, reputation, public life',
                      11: 'Friends, community, hopes',
                      12: 'Spirituality, solitude, endings',
                    };
                    return (
                      <tr key={age} className={`border-b border-border/50 ${isCurrentAge ? 'bg-primary/10 font-medium' : age % 2 === 0 ? 'bg-muted/20' : ''}`}>
                        <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary font-bold' : 'text-foreground'}`}>
                          {age}{isCurrentAge ? ' ←' : ''}
                        </td>
                        <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary' : 'text-foreground'}`}>
                          House {house}
                        </td>
                        <td className={`px-2 py-1 ${isCurrentAge ? 'text-primary' : 'text-muted-foreground'}`}>
                          {themes[house]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* ── Sun Deep Dive ── */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
          <Sun size={16} className="text-primary" />
          ☉ The Sun — Where Your Life Force Goes This Year
        </h3>
        {analysis.sunHouse.house ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-serif text-primary">SR House {analysis.sunHouse.house}</span>
              {analysis.sunNatalHouse.house && analysis.sunNatalHouse.house !== analysis.sunHouse.house && (
                <span className="text-xs text-muted-foreground">→ lands in your natal {analysis.sunNatalHouse.house}th house</span>
              )}
            </div>
            {srSunInHouse[analysis.sunHouse.house] && (
              <div className="space-y-3">
                <p className="text-base font-serif text-foreground">{srSunInHouse[analysis.sunHouse.house].title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{srSunInHouse[analysis.sunHouse.house].overview}</p>
                <div className="bg-secondary/40 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">How You'll Experience It</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{srSunInHouse[analysis.sunHouse.house].experience}</p>
                </div>
                <div className="bg-primary/5 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">What To Focus On</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{srSunInHouse[analysis.sunHouse.house].focus}</p>
                </div>
                <div className="bg-destructive/5 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-destructive mb-1">Watch Out For</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{srSunInHouse[analysis.sunHouse.house].caution}</p>
                </div>
              </div>
            )}
            {/* Overlay narrative */}
            {analysis.sunNatalHouse.house && analysis.sunNatalHouse.house !== analysis.sunHouse.house && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">House Overlay: Where the action is vs. where you feel it</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {srOverlayNarrative('The Sun', analysis.sunHouse.house, analysis.sunNatalHouse.house)}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Add house cusps to the SR chart to see the Sun's house placement and deep interpretation.</p>
        )}
      </div>

      {/* ── Moon Deep Dive ── */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
          <Moon size={16} className="text-primary" />
          ☽ The Moon — Your Emotional Landscape This Year
        </h3>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-2xl">{SIGN_SYMBOLS[analysis.moonSign]}</span>
          <span className="text-lg font-serif text-foreground">Moon in {analysis.moonSign}</span>
          {analysis.moonHouse.house && (
            <span className="text-sm text-muted-foreground">· SR House {analysis.moonHouse.house}</span>
          )}
        </div>

        {/* Moon angularity assessment */}
        {analysis.moonHouse.house && (() => {
          const ang = srMoonAngularity(analysis.moonHouse.house);
          return (
            <div className="bg-primary/5 rounded-sm p-3 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-medium text-primary">{ang.position}</span>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{ang.meaning}</p>
            </div>
          );
        })()}

        {/* Moon sign interpretation */}
        {srMoonInSign[analysis.moonSign] && (
          <div className="mb-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Emotional Temperament ({analysis.moonSign})</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{srMoonInSign[analysis.moonSign]}</p>
          </div>
        )}

        {/* Moon house DEEP interpretation */}
        {analysis.moonHouse.house && srMoonInHouseDeep[analysis.moonHouse.house] && (() => {
          const deep = srMoonInHouseDeep[analysis.moonHouse.house];
          return (
            <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-medium text-primary">SR House {analysis.moonHouse.house}</span>
                <h5 className="text-sm font-semibold text-foreground mt-0.5">{deep.title}</h5>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{deep.overview}</p>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Theme</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{deep.emotionalTheme}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Focus</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{deep.focus}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Caution</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{deep.caution}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Moon overlay */}
        {analysis.moonHouse.house && analysis.moonNatalHouse.house && analysis.moonHouse.house !== analysis.moonNatalHouse.house && (
          <div className="pt-3 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">House Overlay</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {srOverlayNarrative('The Moon', analysis.moonHouse.house, analysis.moonNatalHouse.house)}
            </p>
          </div>
        )}

        {/* ── SR Moon Aspects to SR Planets ── */}
        {(() => {
          const moonSRAspects = analysis.srInternalAspects.filter(
            a => a.planet1 === 'Moon' || a.planet2 === 'Moon'
          );
          if (moonSRAspects.length === 0) return null;
          return (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Moon size={14} className="text-primary" /> SR Moon Aspects to SR Planets
              </h4>
              <p className="text-[10px] text-muted-foreground italic">
                These aspects shape your emotional experience all year — they describe how your feelings interact with other planetary forces within the Solar Return chart.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {moonSRAspects.slice(0, 10).map((asp, i) => {
                  const otherPlanet = asp.planet1 === 'Moon' ? asp.planet2 : asp.planet1;
                  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
                  const moonAspData = srMoonAspects[otherPlanet];
                  const interp = moonAspData ? (isHard ? moonAspData.hard : moonAspData.soft) : null;
                  return (
                    <div key={i} className={`border rounded-sm p-3 space-y-2 ${isHard ? 'border-destructive/20 bg-destructive/5' : 'border-green-500/20 bg-green-500/5'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          ☽ {asp.type} {PLANET_SYMBOLS[otherPlanet]} {otherPlanet}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                        <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${isHard ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                          {isHard ? 'Hard' : 'Soft'}
                        </span>
                      </div>
                      {interp && <p className="text-xs text-muted-foreground leading-relaxed">{interp}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── SR Moon Aspects to Natal Planets ── */}
        {(() => {
          const moonNatalAspects = analysis.srToNatalAspects.filter(a => a.planet1 === 'Moon');
          if (moonNatalAspects.length === 0) return null;
          return (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Moon size={14} className="text-primary" /> SR Moon Aspects to Your Natal Planets
              </h4>
              <p className="text-[10px] text-muted-foreground italic">
                These show how this year's emotional energy activates your birth chart — which natal planets are being "touched" by the SR Moon's emotional force.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {moonNatalAspects.slice(0, 10).map((asp, i) => {
                  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
                  const moonAspData = srMoonAspects[asp.planet2];
                  const interp = moonAspData ? (isHard ? moonAspData.hard : moonAspData.soft) : null;
                  return (
                    <div key={i} className={`border rounded-sm p-3 space-y-2 ${isHard ? 'border-destructive/20 bg-destructive/5' : 'border-green-500/20 bg-green-500/5'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          SR ☽ {asp.type} Natal {PLANET_SYMBOLS[asp.planet2]} {asp.planet2}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                        <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${isHard ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                          {isHard ? 'Hard' : 'Soft'}
                        </span>
                      </div>
                      {interp && <p className="text-xs text-muted-foreground leading-relaxed">{interp}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Angular Planets */}
      {analysis.angularPlanets.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">⚡ Angular Planets — The Year's Powerhouses</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Planets near the SR Ascendant or Midheaven are ANGULAR — they have disproportionate influence over the year. These are the loudest voices in your chart:
          </p>
          <div className="space-y-2">
            {analysis.angularPlanets.map(p => (
              <div key={p} className="bg-primary/5 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{PLANET_SYMBOLS[p] || p.slice(0, 3)}</span>
                  <span className="text-sm font-medium text-foreground">{p}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{angularPlanetMeaning[p] || `${p} on an angle amplifies its themes throughout the year.`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moon Phase — Enhanced */}
      {analysis.moonPhase && (() => {
        const phaseInterp = srMoonPhaseInterp[analysis.moonPhase.phase];
        return (
          <div className="border border-primary/20 rounded-sm p-5 bg-card">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Moon size={14} className="text-primary" /> SR Moon Phase
            </h4>
            <p className="text-lg font-serif text-foreground mb-1">{analysis.moonPhase.phase}</p>
            {phaseInterp && <p className="text-xs font-medium text-primary mb-1">{phaseInterp.theme}</p>}
            {analysis.moonPhase.isEclipse && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-destructive/10 text-destructive rounded-sm">Near Eclipse Axis</span>
            )}
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{phaseInterp?.description || analysis.moonPhase.description}</p>
          </div>
        );
      })()}

      {/* SR Ascendant in Natal House (Lynn Bell) */}
      {analysis.srAscInNatalHouse && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> SR Ascendant in Your Natal Chart
          </h4>
          <p className="text-sm font-medium text-foreground mb-1">
            The SR Ascendant falls in your natal {analysis.srAscInNatalHouse.natalHouse}{analysis.srAscInNatalHouse.natalHouse === 1 ? 'st' : analysis.srAscInNatalHouse.natalHouse === 2 ? 'nd' : analysis.srAscInNatalHouse.natalHouse === 3 ? 'rd' : 'th'} house
          </p>
          <p className="text-xs text-primary mb-2">{analysis.srAscInNatalHouse.natalHouseTheme}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.srAscInNatalHouse.interpretation}</p>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Source: Lynn Bell — "Cycles of Light." The natal house where the SR Ascendant lands shows which area of life is most activated by the year's themes.
          </p>
        </div>
      )}

      {/* Natal Degree Conduits (Lynn Bell: SR planet on natal degree) */}
      {analysis.natalDegreeConduits.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <Target size={14} className="text-primary" /> Natal Degree Connections
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            When a Solar Return planet lands on the same degree as a natal planet (within 2°), it becomes a "conduit" — reawakening that natal energy all year. These are among the most significant indicators in a Solar Return. (Source: Lynn Bell)
          </p>
          <div className="space-y-2">
            {analysis.natalDegreeConduits.map((c, i) => (
              <div key={i} className="bg-secondary/40 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    SR {PLANET_SYMBOLS[c.srPlanet]} {c.srPlanet} → Natal {PLANET_SYMBOLS[c.natalPlanet]} {c.natalPlanet}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {SIGN_SYMBOLS[c.srSign]} {c.degree} (orb: {c.orb}°)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moon Timing Events (Lynn Bell: 1° per month) */}
      {analysis.moonTimingEvents.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <Moon size={14} className="text-primary" /> Moon Timing — When Things Happen This Year
          </h4>
          <div className="bg-secondary/40 rounded-sm p-3 mb-4 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Why this matters:</strong> The SR Moon is the year's internal clock. It advances approximately 1° per month from its birthday position. When it perfects an aspect to another SR planet, that month marks a <em>turning point</em> — events connected to that planet's themes activate. This is one of the most practical timing tools in Solar Return work.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Think of the Moon as a spotlight moving through the year, illuminating each planet it touches. Conjunctions and oppositions mark the strongest activations; trines and sextiles bring opportunities; squares bring turning points that demand action.
            </p>
            <p className="text-[10px] text-muted-foreground italic">
              Source: Lynn Bell — "Cycles of Light"; Mary Fortier Shea — "Planets in Solar Returns"
            </p>
          </div>
          <div className="space-y-3">
            {analysis.moonTimingEvents.slice(0, 12).map((evt, i) => (
              <div key={i} className="border border-border/50 rounded-sm p-3 bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm shrink-0">
                    {evt.approximateMonth}
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    ☽ {evt.aspectType} {PLANET_SYMBOLS[evt.targetPlanet]} {evt.targetPlanet}
                  </span>
                  {evt.targetSRHouse && (
                    <span className="text-[10px] text-muted-foreground">
                      (SR House {evt.targetSRHouse})
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{evt.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stelliums */}
      {analysis.stelliums.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <Layers size={14} className="text-primary" /> Stelliums — Concentrated Energy
            </h4>
            <p className="text-xs text-muted-foreground">A stellium requires 3+ true planets (Sun through Pluto) in the same sign or house. Asteroids and points do not count toward a stellium but are noted when present.</p>
          </div>
          {analysis.stelliums.map((s, i) => (
            <div key={i} className="border border-border rounded-sm p-4 bg-card space-y-3">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-base font-serif text-foreground">{s.planets.length}-Planet Stellium in {s.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {s.planets.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-sm font-medium">
                      {PLANET_SYMBOLS[p]} {p}
                    </span>
                  ))}
                  {s.extras.length > 0 && (
                    <>
                      <span className="text-[10px] text-muted-foreground self-center">also present:</span>
                      {s.extras.map(e => (
                        <span key={e} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-sm">
                          {PLANET_SYMBOLS[e]} {e}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.interpretation}</p>
              </div>

              {/* Sign meaning (for sign stelliums) */}
              {s.signMeaning && (
                <div className="bg-secondary/40 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What {s.location} Dominance Means For Your Year</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.signMeaning}</p>
                </div>
              )}

              {/* Blend meaning — what THIS combination of planets means */}
              {s.blendMeaning && (
                <div className="bg-primary/5 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">This Specific Combination</p>
                  {s.blendMeaning.split('\n\n').map((para, j) => (
                    <p key={j} className="text-sm text-muted-foreground leading-relaxed mb-2 last:mb-0">{para}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Element & Modality Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Flame size={14} className="text-primary" /> Element Balance
          </h4>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { el: 'Fire', val: analysis.elementBalance.fire, icon: '🔥', planets: analysis.elementBalance.firePlanets },
              { el: 'Earth', val: analysis.elementBalance.earth, icon: '🌍', planets: analysis.elementBalance.earthPlanets },
              { el: 'Air', val: analysis.elementBalance.air, icon: '💨', planets: analysis.elementBalance.airPlanets },
              { el: 'Water', val: analysis.elementBalance.water, icon: '💧', planets: analysis.elementBalance.waterPlanets },
            ].map(({ el, val, icon, planets }) => (
              <div key={el} className={`text-center p-2 rounded-sm ${el.toLowerCase() === analysis.elementBalance.dominant ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'}`}>
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-medium text-foreground">{val}</p>
                <p className="text-[10px] text-muted-foreground mb-1">{el}</p>
                {planets.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {planets.map(p => (
                      <span key={p} className="text-[10px] text-muted-foreground" title={p}>{PLANET_SYMBOLS[p]}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{analysis.elementBalance.interpretation}</p>
        </div>
        <div className="border border-border rounded-sm p-4 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Repeat size={14} className="text-primary" /> Modality Balance
          </h4>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { mod: 'Cardinal', val: analysis.modalityBalance.cardinal, planets: analysis.modalityBalance.cardinalPlanets },
              { mod: 'Fixed', val: analysis.modalityBalance.fixed, planets: analysis.modalityBalance.fixedPlanets },
              { mod: 'Mutable', val: analysis.modalityBalance.mutable, planets: analysis.modalityBalance.mutablePlanets },
            ].map(({ mod, val, planets }) => (
              <div key={mod} className={`text-center p-2 rounded-sm ${mod.toLowerCase() === analysis.modalityBalance.dominant ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'}`}>
                <p className="text-sm font-medium text-foreground">{val}</p>
                <p className="text-[10px] text-muted-foreground mb-1">{mod}</p>
                {planets.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {planets.map(p => (
                      <span key={p} className="text-[10px] text-muted-foreground" title={p}>{PLANET_SYMBOLS[p]}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{analysis.modalityBalance.interpretation}</p>
        </div>
      </div>

      {/* Retrogrades */}
      <div className="border border-border rounded-sm p-4 bg-card">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <RotateCcw size={14} className="text-primary" /> Retrograde Planets
        </h4>
        {analysis.retrogrades.count > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {analysis.retrogrades.planets.map(p => (
              <span key={p} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-sm">
                {PLANET_SYMBOLS[p]} {p} Rx
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground mb-2">No retrograde planets ✓</p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.retrogrades.interpretation}</p>
      </div>

      {/* Saturn & Nodes side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.saturnFocus && (
          <div className="border border-border rounded-sm p-4 bg-card">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              ♄ Saturn's Assignment
            </h4>
            <p className="text-sm text-foreground mb-1">
              {SIGN_SYMBOLS[analysis.saturnFocus.sign]} {analysis.saturnFocus.sign}
              {analysis.saturnFocus.house && ` · SR House ${analysis.saturnFocus.house}`}
              {analysis.saturnFocus.isRetrograde && ' · Rx'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.saturnFocus.interpretation}</p>
          </div>
        )}
        {analysis.nodesFocus && (
          <div className="border border-border rounded-sm p-4 bg-card">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Target size={14} className="text-primary" /> Growth Edge (North Node)
            </h4>
            <p className="text-sm text-foreground mb-1">
              {SIGN_SYMBOLS[analysis.nodesFocus.sign]} {analysis.nodesFocus.sign}
              {analysis.nodesFocus.house && ` · SR House ${analysis.nodesFocus.house}`}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.nodesFocus.interpretation}</p>
          </div>
        )}
      </div>

      {/* ── Vertex — Fated Encounters ── */}
      {analysis.vertex && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-1 flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            Vertex — Fated Encounters This Year
          </h3>
          <p className="text-[10px] text-muted-foreground italic">
            The Vertex is the intersection of the Prime Vertical with the Ecliptic — it marks where destiny, fated encounters, and events beyond conscious control enter your life. (Sources: L. Edward Johndro, Charles Jayne, Brian Clark)
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-serif text-primary">
              Vx {SIGN_SYMBOLS[analysis.vertex.sign] || ''} {analysis.vertex.sign} {analysis.vertex.degree}°{String(analysis.vertex.minutes).padStart(2, '0')}'
            </span>
            {analysis.vertex.house && (
              <span className="text-xs bg-muted px-2 py-1 rounded-sm text-muted-foreground">SR House {analysis.vertex.house}</span>
            )}
          </div>

          {/* Vertex in Sign */}
          {vertexInSign[analysis.vertex.sign] && (
            <div className="space-y-2 border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-foreground">{vertexInSign[analysis.vertex.sign].title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{vertexInSign[analysis.vertex.sign].fatedTheme}</p>
              <div className="bg-secondary/50 rounded-sm p-3 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Who May Appear</p>
                <p className="text-xs text-foreground leading-relaxed">{vertexInSign[analysis.vertex.sign].encounters}</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">The Lesson</p>
                <p className="text-xs text-foreground leading-relaxed">{vertexInSign[analysis.vertex.sign].lesson}</p>
              </div>
            </div>
          )}

          {/* Vertex in House */}
          {analysis.vertex.house && vertexInHouse[analysis.vertex.house] && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">{vertexInHouse[analysis.vertex.house].title} (House {analysis.vertex.house})</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{vertexInHouse[analysis.vertex.house].description}</p>
              <p className="text-[10px] text-muted-foreground"><strong>Fated Areas:</strong> {vertexInHouse[analysis.vertex.house].fatedArea}</p>
            </div>
          )}

          {/* Vertex Aspects */}
          {analysis.vertex.aspects.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Planets Aspecting Your Vertex</h4>
              <div className="space-y-2">
                {analysis.vertex.aspects.slice(0, 8).map((asp, i) => {
                  const cleanPlanet = asp.planet.replace('Natal ', '');
                  const isNatal = asp.planet.startsWith('Natal ');
                  return (
                    <div key={i} className="border border-border rounded-sm p-3 bg-muted/20">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{PLANET_SYMBOLS[cleanPlanet] || cleanPlanet.slice(0, 3)} {asp.planet}</span>
                        <span className={`font-medium ${asp.aspectType === 'Conjunction' ? 'text-primary' : asp.aspectType === 'Trine' || asp.aspectType === 'Sextile' ? 'text-green-500' : 'text-red-400'}`}>
                          {asp.aspectType}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                      </div>
                      {vertexAspectMeanings[cleanPlanet] && (
                        <p className="text-xs text-muted-foreground mt-1">{isNatal ? '(Natal) ' : ''}{vertexAspectMeanings[cleanPlanet]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Planet Spotlight: Jupiter, Mercury, Venus, Mars ── */}
      {(() => {
        const deepData: Record<string, Record<number, SRPlanetHouseDeep>> = {
          Jupiter: srJupiterInHouseDeep,
          Mercury: srMercuryInHouseDeep,
          Venus: srVenusInHouseDeep,
          Mars: srMarsInHouseDeep,
        };
        const spotlightPlanets = ['Jupiter', 'Mercury', 'Venus', 'Mars'].filter(p => {
          const h = analysis.planetSRHouses[p];
          return h !== null && h !== undefined && deepData[p]?.[h];
        });
        if (spotlightPlanets.length === 0) return null;
        return (
          <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-5">
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Planet Spotlight — Expert Analysis
            </h3>
            <p className="text-[10px] text-muted-foreground italic">
              Deep interpretations for key personal planets in your SR houses. Sources: Ciro Discepolo, Mary Fortier Shea, Brian Clark.
            </p>
            {spotlightPlanets.map(planet => {
              const h = analysis.planetSRHouses[planet]!;
              const data = deepData[planet][h];
              if (!data) return null;
              const overlay = analysis.houseOverlays.find(o => o.planet === planet);
              return (
                <details key={planet} className="border border-border rounded-sm bg-muted/20">
                  <summary className="p-3 cursor-pointer hover:bg-muted/40 transition-colors">
                    <span className="text-sm font-medium text-foreground">
                      {PLANET_SYMBOLS[planet]} {planet} in SR House {h}
                      {overlay?.natalHouse && overlay.natalHouse !== h ? ` → Natal House ${overlay.natalHouse}` : ''}
                      <span className="text-muted-foreground font-normal"> — {data.title}</span>
                    </span>
                  </summary>
                  <div className="p-4 pt-0 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.overview}</p>
                    <div className="bg-secondary/50 rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Practical Manifestation</p>
                      <p className="text-xs text-foreground leading-relaxed">{data.practical}</p>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/10 rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-1">Caution</p>
                      <p className="text-xs text-foreground leading-relaxed">{data.caution}</p>
                    </div>
                    {data.source && (
                      <p className="text-[10px] text-muted-foreground italic">Source: {data.source}</p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        );
      })()}

      {analysis.hemisphericEmphasis && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-5">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Compass size={14} className="text-primary" /> Hemispheric Emphasis — Expert Analysis
          </h4>

          {/* Counts bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Upper', value: analysis.hemisphericEmphasis.upper, desc: 'Houses 7–12' },
              { label: 'Lower', value: analysis.hemisphericEmphasis.lower, desc: 'Houses 1–6' },
              { label: 'East', value: analysis.hemisphericEmphasis.east, desc: 'Houses 10–3' },
              { label: 'West', value: analysis.hemisphericEmphasis.west, desc: 'Houses 4–9' },
            ].map(item => (
              <div key={item.label} className="border border-border rounded-sm p-2 bg-muted/30">
                <div className="text-lg font-semibold text-foreground">{item.value}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{item.label}</div>
                <div className="text-[9px] text-muted-foreground/70">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Vertical axis (upper/lower) */}
          <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-medium text-primary">{analysis.hemisphericEmphasis.verticalLabel}</span>
            </div>
            <h5 className="text-sm font-semibold text-foreground">{analysis.hemisphericEmphasis.verticalDetail.title}</h5>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">{analysis.hemisphericEmphasis.verticalDetail.summary}</p>
            {analysis.hemisphericEmphasis.verticalDetail.bodyParagraphs.map((p, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
            ))}
            <div className="grid gap-3 sm:grid-cols-3 mt-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Focus Areas</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.verticalDetail.focusAreas.map((f, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Challenges</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.verticalDetail.challenges.map((c, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Practical Advice</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.verticalDetail.practicalAdvice.map((a, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Horizontal axis (east/west) */}
          <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-medium text-primary">{analysis.hemisphericEmphasis.horizontalLabel}</span>
            </div>
            <h5 className="text-sm font-semibold text-foreground">{analysis.hemisphericEmphasis.horizontalDetail.title}</h5>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">{analysis.hemisphericEmphasis.horizontalDetail.summary}</p>
            {analysis.hemisphericEmphasis.horizontalDetail.bodyParagraphs.map((p, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
            ))}
            <div className="grid gap-3 sm:grid-cols-3 mt-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Focus Areas</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.horizontalDetail.focusAreas.map((f, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Challenges</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.horizontalDetail.challenges.map((c, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Practical Advice</div>
                <ul className="space-y-1">
                  {analysis.hemisphericEmphasis.horizontalDetail.practicalAdvice.map((a, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-snug">• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Combined cross-axis insight */}
          <div className="border border-primary/30 rounded-sm p-4 bg-primary/5">
            <div className="text-[10px] uppercase tracking-widest text-primary mb-2">Combined Axis Synthesis</div>
            <p className="text-xs text-foreground leading-relaxed">{analysis.hemisphericEmphasis.combinedInsight}</p>
          </div>
        </div>
      )}

      {/* Repeated Natal Themes */}
      {analysis.repeatedThemes.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> Confirmed Natal Themes
          </h4>
          <div className="space-y-3">
            {analysis.repeatedThemes.map((t, i) => (
              <div key={i} className="bg-primary/5 rounded-sm p-3">
                <p className="text-sm font-medium text-foreground">{t.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.significance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SR vs Natal Biwheel Comparison Table */}
      <div className="border border-border rounded-sm p-4 bg-card">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SR ↔ Natal Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground">Planet</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-primary/80">SR Position</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-primary/80">SR House</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-accent-foreground/60">Natal Position</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-accent-foreground/60">Natal House</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-widest text-muted-foreground">Movement</th>
              </tr>
            </thead>
            <tbody>
              {ALL_DISPLAY_PLANETS.map(planet => {
                const srPos = srChart.planets[planet as keyof typeof srChart.planets];
                const natPos = natalChart.planets[planet as keyof typeof natalChart.planets];
                if (!srPos && !natPos) return null;
                const srH = analysis.planetSRHouses?.[planet];
                // Find natal house
                const natH = (() => {
                  if (!natPos?.sign || !natalChart.houseCusps) return null;
                  const overlay = analysis.houseOverlays.find(o => o.planet === planet);
                  return overlay?.natalHouse ?? null;
                })();
                const sameSign = srPos?.sign && natPos?.sign && srPos.sign === natPos.sign;
                return (
                  <tr key={planet} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-1.5 px-2 font-medium text-foreground">
                      {PLANET_SYMBOLS[planet] || planet.slice(0,2)} {planet}
                      {srPos?.isRetrograde && <span className="text-destructive ml-1 text-[9px]">Rx</span>}
                    </td>
                    <td className="py-1.5 px-2 text-foreground">
                      {srPos ? `${SIGN_SYMBOLS[srPos.sign] || ''} ${srPos.sign} ${srPos.degree}°${srPos.minutes || 0}'` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">{srH != null ? `H${srH}` : '—'}</td>
                    <td className="py-1.5 px-2 text-foreground">
                      {natPos ? `${SIGN_SYMBOLS[natPos.sign] || ''} ${natPos.sign} ${natPos.degree}°${natPos.minutes || 0}'` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">{natH != null ? `H${natH}` : '—'}</td>
                    <td className="py-1.5 px-2">
                      {sameSign ? (
                        <span className="text-primary text-[9px]">Same sign</span>
                      ) : srPos?.sign && natPos?.sign ? (
                        <span className="text-muted-foreground text-[9px]">{natPos.sign} → {srPos.sign}</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Year-Ahead Narrative */}
      <SRNarrativeBox analysis={analysis} srChart={srChart} natalChart={natalChart} />

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

// ─── AI Narrative Synthesis ─────────────────────────────────────────

const SRNarrativeBox = ({ analysis, srChart, natalChart }: {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}) => {
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { buildPromptBlock: buildRefBlock } = useDocumentExcerpts();

  const generateNarrative = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-sr-narrative', {
        body: {
          analysisData: analysis,
          chartName: natalChart.name,
          srYear: srChart.solarReturnYear,
          referenceExcerpts: buildRefBlock(),
        },
      });
      if (fnError) throw fnError;
      if (data?.narrative) {
        setNarrative(data.narrative);
      } else {
        throw new Error('No narrative returned');
      }
    } catch (err: any) {
      console.error('SR narrative error:', err);
      setError(err.message || 'Failed to generate narrative');
      toast.error('Failed to generate year-ahead narrative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-primary/30 rounded-sm p-5 bg-card">
      <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        Year-Ahead Narrative Synthesis
      </h3>
      {!narrative && !loading && (
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate an AI-written year-ahead reading that weaves together all the data from your Solar Return — Lord of the Year, Profection, Moon Phase, Stelliums, Saturn, and more — into a cohesive narrative.
          </p>
          <button
            onClick={generateNarrative}
            className="text-[11px] uppercase tracking-widest px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            Generate Year-Ahead Reading
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
      {loading && (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Synthesizing your Solar Return data...</p>
        </div>
      )}
      {narrative && !loading && (
        <div className="space-y-3">
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:text-sm prose-headings:uppercase prose-headings:tracking-widest prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground">
            <ReactMarkdown>{narrative}</ReactMarkdown>
          </div>
          <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
            <button
              onClick={generateNarrative}
              className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Regenerate
            </button>
            <SolarReturnPDFExport
              analysis={analysis}
              srChart={srChart}
              natalChart={natalChart}
              narrative={narrative}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── House Overlay Tab ──────────────────────────────────────────────

const HouseOverlayTab = ({ analysis }: { analysis: SolarReturnAnalysis }) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-sm">
        <Info size={14} className="inline mr-1" />
        The <strong>SR house</strong> shows WHERE the action happens. The <strong>natal house overlay</strong> shows WHERE YOU FEEL IT. This is the key to understanding your Solar Return — it is not just what house a planet sits in, but how that house's energy lands on YOUR natal chart.
      </div>

      {analysis.houseOverlays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add house cusps to see house overlays.</p>
      ) : (
        <div className="space-y-3">
          {analysis.houseOverlays.map((overlay, i) => {
            const planetInterps = srPlanetInHouse[overlay.planet];
            const planetHouseInterp = overlay.srHouse && planetInterps ? planetInterps[overlay.srHouse] : null;
            const overlayNarr = srOverlayNarrative(overlay.planet, overlay.srHouse, overlay.natalHouse);
            return (
              <div key={i} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-start gap-3">
                  <span className="text-xl w-8 text-center mt-0.5">{PLANET_SYMBOLS[overlay.planet] || overlay.planet.slice(0, 2)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-foreground">{overlay.planet}</span>
                      <span className="text-xs text-muted-foreground">
                        {SIGN_SYMBOLS[overlay.srSign]} {overlay.srSign} {overlay.srDegree}
                      </span>
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span className="text-sm text-primary font-medium">
                        SR House {overlay.srHouse || '—'}
                      </span>
                      {overlay.natalHouse && (
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
                          → Natal House {overlay.natalHouse}
                        </span>
                      )}
                    </div>
                    {/* SR house theme */}
                    {overlay.srHouseTheme && (
                      <p className="text-[10px] text-muted-foreground mb-2">{overlay.srHouseTheme}</p>
                    )}
                    {/* Deep planet-in-house interpretation */}
                    {planetHouseInterp && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">{planetHouseInterp}</p>
                    )}
                    {/* Overlay narrative */}
                    {overlayNarr && overlay.natalHouse && overlay.srHouse !== overlay.natalHouse && (
                      <div className="bg-secondary/40 rounded-sm p-2 mt-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Overlay</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{overlayNarr}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
  const [expandedAspect, setExpandedAspect] = useState<number | null>(null);
  const [expandedInternal, setExpandedInternal] = useState<number | null>(null);

  const aspectBg = (type: string) => {
    if (['Square', 'Opposition', 'Quincunx'].includes(type)) return 'bg-red-950/20 border-red-900/30';
    if (['Trine', 'Sextile'].includes(type)) return 'bg-emerald-950/20 border-emerald-900/30';
    if (type === 'Conjunction') return 'bg-amber-950/20 border-amber-900/30';
    return 'bg-card border-border';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* SR to Natal — Expert Deep Dive */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Planets → Your Natal Chart</h4>
        <p className="text-xs text-muted-foreground mb-3">Tap any aspect to see what it means for YOU — how it feels, why it matters, and what to do about it.</p>
        {analysis.srToNatalAspects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No major aspects detected.</p>
        ) : (
          <div className="space-y-2">
            {analysis.srToNatalAspects.filter(a => !(a.planet1 === 'Sun' && a.planet2 === 'Sun' && a.type === 'Conjunction')).slice(0, 20).map((asp, i) => {
              const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
              const aspInfo = aspectTypeMeanings[asp.type];
              const isExpanded = expandedAspect === i;

              return (
                <div key={i} className={`border rounded-md overflow-hidden transition-all ${aspectBg(asp.type)}`}>
                  {/* Header — always visible */}
                  <button
                    onClick={() => setExpandedAspect(isExpanded ? null : i)}
                    className="w-full p-3 flex items-center gap-2 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base">{PLANET_SYMBOLS[asp.planet1] || asp.planet1.slice(0, 2)}</span>
                    <span className="text-xs text-muted-foreground">SR {asp.planet1}</span>
                    <span className={`text-sm font-semibold ${aspectColor(asp.type)}`}>
                      {aspInfo?.glyph || ''} {asp.type}
                    </span>
                    <span className="text-base">{PLANET_SYMBOLS[asp.planet2] || asp.planet2.slice(0, 2)}</span>
                    <span className="text-xs text-muted-foreground">Natal {asp.planet2}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto mr-2">orb {asp.orb}°</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  {/* Expanded — full expert interpretation */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                      {/* What this aspect type means */}
                      {aspInfo && (
                        <div className="mt-3 p-3 rounded bg-background/50">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What is a {asp.type}?</p>
                          <p className="text-xs leading-relaxed">{aspInfo.childExplain}</p>
                        </div>
                      )}

                      {/* Planet meanings side by side */}
                      <div className="grid grid-cols-2 gap-2">
                        {[{ planet: asp.planet1, label: 'SR', data: planetLifeMeanings[asp.planet1] },
                          { planet: asp.planet2, label: 'Natal', data: planetLifeMeanings[asp.planet2] }
                        ].map(({ planet, label, data }) => data && (
                          <div key={planet + label} className="p-2.5 rounded bg-background/50">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{PLANET_SYMBOLS[planet] || ''} {label} {planet}</p>
                            <p className="text-[10px] font-medium text-primary mb-1">{data.rules}</p>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">{data.inYourLife}</p>
                          </div>
                        ))}
                      </div>

                      {/* How it feels */}
                      <div className="p-3 rounded bg-background/50">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">🫀 How You'll Feel This Year</p>
                        <p className="text-xs leading-relaxed">{interp.howItFeels}</p>
                      </div>

                      {/* What it means */}
                      <div className="p-3 rounded bg-background/50">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">📖 What It Really Means</p>
                        <p className="text-xs leading-relaxed">{interp.whatItMeans}</p>
                      </div>

                      {/* What to do */}
                      <div className="p-3 rounded bg-primary/10 border border-primary/20">
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">✦ What To Do About It</p>
                        <p className="text-xs leading-relaxed">{interp.whatToDo}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SR internal — same expandable treatment */}
      <div>
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SR Internal Aspects</h4>
        <p className="text-xs text-muted-foreground mb-3">How the planets in THIS year's chart talk to each other — the internal dynamics of your solar return.</p>
        {analysis.srInternalAspects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No major internal aspects.</p>
        ) : (
          <div className="space-y-2">
            {analysis.srInternalAspects.slice(0, 15).map((asp, i) => {
              const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
              const aspInfo = aspectTypeMeanings[asp.type];
              const isExpanded = expandedInternal === i;

              return (
                <div key={i} className={`border rounded-md overflow-hidden transition-all ${aspectBg(asp.type)}`}>
                  <button
                    onClick={() => setExpandedInternal(isExpanded ? null : i)}
                    className="w-full p-3 flex items-center gap-2 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base">{PLANET_SYMBOLS[asp.planet1] || asp.planet1.slice(0, 2)}</span>
                    <span className="text-xs text-muted-foreground">{asp.planet1}</span>
                    <span className={`text-sm font-semibold ${aspectColor(asp.type)}`}>
                      {aspInfo?.glyph || ''} {asp.type}
                    </span>
                    <span className="text-base">{PLANET_SYMBOLS[asp.planet2] || asp.planet2.slice(0, 2)}</span>
                    <span className="text-xs text-muted-foreground">{asp.planet2}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto mr-2">orb {asp.orb}°</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                      {aspInfo && (
                        <div className="mt-3 p-3 rounded bg-background/50">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What is a {asp.type}?</p>
                          <p className="text-xs leading-relaxed">{aspInfo.childExplain}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {[asp.planet1, asp.planet2].map(planet => {
                          const data = planetLifeMeanings[planet];
                          return data ? (
                            <div key={planet} className="p-2.5 rounded bg-background/50">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{PLANET_SYMBOLS[planet] || ''} {planet}</p>
                              <p className="text-[10px] font-medium text-primary mb-1">{data.rules}</p>
                              <p className="text-[11px] leading-relaxed text-muted-foreground">{data.inYourLife}</p>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="p-3 rounded bg-background/50">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">🫀 How This Plays Out</p>
                        <p className="text-xs leading-relaxed">{interp.howItFeels}</p>
                      </div>

                      <div className="p-3 rounded bg-primary/10 border border-primary/20">
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">✦ What To Do About It</p>
                        <p className="text-xs leading-relaxed">{interp.whatToDo}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
