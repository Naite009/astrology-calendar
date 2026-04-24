import { useState, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Sun, MapPin, ArrowRight, Compass, Star, Globe, ChevronDown, ChevronUp, Info, Upload, Loader2, Moon, Flame, Droplets, Wind, Mountain, RotateCcw, Repeat, Layers, Target, Sparkles, Zap, Download } from 'lucide-react';
import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart, useSolarReturnChart } from '@/hooks/useSolarReturnChart';
import { analyzeSolarReturn, SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { srSunInHouse, srMoonInHouse, srMoonInSign, srOverlayNarrative, srPlanetInHouse, rulerConditionNarrative, angularPlanetMeaning } from '@/lib/solarReturnInterpretations';
import { srMoonInHouseDeep, srMoonPhaseInterp, srMoonAngularity, srMoonAspects, getMoonPhaseBlending } from '@/lib/solarReturnMoonData';
import { vertexInSign, vertexInHouse, vertexAspectMeanings } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep, type SRPlanetHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, aspectTypeMeanings, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';
import { formatDateMMDDYYYY } from '@/lib/localDate';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentExcerpts } from '@/hooks/useDocumentExcerpts';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { SolarReturnPDFExport, generateBirthdayGiftPDF, downloadBirthdayJSONStandalone, buildFullJsonStandalone } from '@/components/SolarReturnPDFExport';
import { SROverviewDashboard } from '@/components/solarReturn/SROverviewDashboard';
import { LunarPhaseTimeline } from '@/components/solarReturn/LunarPhaseTimeline';
import { StoryOfTheYear } from '@/components/solarReturn/StoryOfTheYear';

import { NatalOverlayCard } from '@/components/solarReturn/NatalOverlayCard';
import { LandsVsPlaysOutCard } from '@/components/solarReturn/LandsVsPlaysOutCard';
import { AngleActivationCard } from '@/components/solarReturn/AngleActivationCard';
import { PlanetToAngleCard } from '@/components/solarReturn/PlanetToAngleCard';
import { PsychologicalProfileCard } from '@/components/solarReturn/PsychologicalProfileCard';
import { ActivationTimeline } from '@/components/solarReturn/ActivationTimeline';
import { ActionGuidanceCard } from '@/components/solarReturn/ActionGuidanceCard';
import { ExecutiveSummaryCard } from '@/components/solarReturn/ExecutiveSummaryCard';
import { calculateActivationWindows } from '@/lib/solarReturnActivationWindows';
import { generateActionGuidance } from '@/lib/solarReturnActionGuidance';
import { generateExecutiveSummary } from '@/lib/solarReturnExecutiveSummary';
import { generateIdentityShift } from '@/lib/solarReturnIdentityShift';
import { calculateLifeDomainScores } from '@/lib/solarReturnLifeDomainScores';
import { generatePowerPortrait } from '@/lib/solarReturnPowerPortrait';
import { generateDomainDeepDives } from '@/lib/solarReturnDomainDeepDive';
import { detectContradictions } from '@/lib/solarReturnContradictions';
import { generateLunarWeatherMap } from '@/lib/solarReturnLunarWeather';
import { IdentityShiftCard } from '@/components/solarReturn/IdentityShiftCard';
import { LifeDomainScoresCard } from '@/components/solarReturn/LifeDomainScoresCard';
import { ContradictionCard } from '@/components/solarReturn/ContradictionCard';
import { LunarWeatherCard } from '@/components/solarReturn/LunarWeatherCard';
import { PowerPortraitCard } from '@/components/solarReturn/PowerPortraitCard';
import { DominantPlanetsCard } from '@/components/DominantPlanetsCard';
import { DomainDeepDiveCards } from '@/components/solarReturn/DomainDeepDiveCards';
import { AiReadingModal } from '@/components/solarReturn/AiReadingModal';
import { fetchReading, type AiReadingMode } from '@/components/solarReturn/AiReadingModal';
import { AstrocartographyMap } from '@/components/solarReturn/AstrocartographyMap';
import { calculateSolarReturnAuto } from '@/lib/solarReturnAutoCalculator';
import { getCoordinatesFromLocation } from '@/lib/placidusHouses';
import { TierButtonRow } from '@/components/solarReturn/TierButtonRow';
import { TierPreviewPanel } from '@/components/solarReturn/TierPreviewPanel';
import { TierPreviewContent } from '@/components/solarReturn/TierPreviewContent';

// New 8-tab components
import { ThisYearTab } from '@/components/solarReturn/tabs/ThisYearTab';
import { TheMoonTab } from '@/components/solarReturn/tabs/TheMoonTab';
import { ProfileTab } from '@/components/solarReturn/tabs/ProfileTab';
import { TimeLordsTab } from '@/components/solarReturn/tabs/TimeLordsTab';
import { LifeAreasTab } from '@/components/solarReturn/tabs/LifeAreasTab';
import { PlanetsHousesTab } from '@/components/solarReturn/tabs/PlanetsHousesTab';
import { AspectsTimingTab } from '@/components/solarReturn/tabs/AspectsTimingTab';

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

/** Capitalize each word in a location string (e.g. "washington, DC" → "Washington, DC") */
const capitalizeLocation = (loc: string): string =>
  loc.replace(/\b[a-z]/g, c => c.toUpperCase());

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export const SolarReturnView = ({ userNatalChart, savedCharts }: Props) => {
  const allCharts = useMemo(() => {
    const sorted = [...savedCharts]
      .filter(c => c.id !== userNatalChart?.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    return [
      ...(userNatalChart ? [userNatalChart] : []),
      ...sorted,
    ];
  }, [userNatalChart, savedCharts]);

  const {
    solarReturnCharts, addSolarReturn, updateSolarReturn, deleteSolarReturn,
    getSolarReturnsForChart,
  } = useSolarReturnChart();

  // Only show natal charts that have at least one SR chart uploaded
  const natalChartsWithSR = useMemo(() => {
    return allCharts.filter(c => getSolarReturnsForChart(c.id).length > 0)
      .sort((a, b) => {
        if (a.id === userNatalChart?.id) return -1;
        if (b.id === userNatalChart?.id) return 1;
        return a.name.localeCompare(b.name);
      });
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
  const [showAiReading, setShowAiReading] = useState(false);
  const [aiReadings, setAiReadings] = useState<{ plain: string; astro: string }>({ plain: '', astro: '' });
  const [isGeneratingForExport, setIsGeneratingForExport] = useState(false);
  const abortExportRef = useRef<AbortController | null>(null);
  // Tier preview — which tier pill is currently expanded
  const [activeTier, setActiveTier] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!selectedSR || !selectedNatal) return null;
    return analyzeSolarReturn(selectedSR, selectedNatal);
  }, [selectedSR, selectedNatal]);

  const handleBirthdayGiftExport = useCallback(async () => {
    if (!analysis || !selectedSR || !selectedNatal) return;

    // If AI readings already exist, download immediately
    if (aiReadings.plain && aiReadings.astro) {
      downloadBirthdayJSONStandalone(analysis, selectedSR, selectedNatal, aiReadings);
      return;
    }

    // Auto-generate both readings first
    setIsGeneratingForExport(true);
    toast.info('Generating AI readings before export… this takes about a minute.');
    const controller = new AbortController();
    abortExportRef.current = controller;

    try {
      const fullJson = buildFullJsonStandalone(analysis, selectedSR, selectedNatal, aiReadings);

      const [plainResult, astroResult] = await Promise.all([
        fetchReading(fullJson, 'plain', controller.signal, () => {}),
        fetchReading(fullJson, 'astro', controller.signal, () => {}),
      ]);

      const finalReadings = { plain: plainResult, astro: astroResult };
      setAiReadings(finalReadings);
      toast.success('AI readings generated — downloading JSON');
      downloadBirthdayJSONStandalone(analysis, selectedSR, selectedNatal, finalReadings);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Auto-generate AI error:', err);
        toast.error(err.message || 'Failed to generate AI readings');
        // Download anyway with whatever we have
        downloadBirthdayJSONStandalone(analysis, selectedSR, selectedNatal, aiReadings);
      }
    } finally {
      setIsGeneratingForExport(false);
      abortExportRef.current = null;
    }
  }, [analysis, selectedSR, selectedNatal, aiReadings]);

  // Tier button handler — 'gift' downloads immediately; t1-t5 toggle the preview panel
  const handleTierDownload = useCallback((tier: string) => {
    if (tier === 'gift') {
      setActiveTier(null);
      handleBirthdayGiftExport();
      return;
    }
    setActiveTier(prev => prev === tier ? null : tier);
  }, [handleBirthdayGiftExport]);

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
            {allCharts.map(c => {
              const existingYears = getSolarReturnsForChart(c.id)
                .map(s => s.solarReturnYear)
                .sort((a, b) => b - a);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedNatalId(c.id);
                    setShowInputForm(true);
                    setEditingSRId(null);
                    setShowAddForNewPerson(false);
                  }}
                  className="text-left text-sm px-3 py-2 rounded-sm border border-border bg-secondary text-foreground hover:border-primary transition-all"
                >
                  <div>{c.id === userNatalChart?.id ? `★ ${c.name}` : c.name}</div>
                  {existingYears.length > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Already has: SR {existingYears.join(', ')}
                    </div>
                  )}
                </button>
              );
            })}
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
        <>
        {/* Top-level export buttons */}
        <div className="flex items-center gap-3 p-3 border border-border rounded-sm bg-card/60">
          <button
            onClick={handleBirthdayGiftExport}
            disabled={isGeneratingForExport}
            className="flex items-center gap-2.5 px-6 py-3 rounded-lg text-base font-semibold transition-all hover:opacity-80 disabled:opacity-50 shadow-sm"
            style={{ backgroundColor: '#FFF8E1', color: '#5D4037', border: '2px solid #D4A574' }}
          >
            {isGeneratingForExport ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isGeneratingForExport ? 'Generating…' : 'Download JSON'}
          </button>
          <span className="text-xs text-muted-foreground">
            {aiReadings.plain && aiReadings.astro
              ? '✓ AI readings included'
              : 'AI readings will auto-generate before download'}
          </span>
          <button
            onClick={() => setShowAiReading(true)}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-secondary transition-all"
          >
            <Sparkles size={10} />
            Generate AI Reading
          </button>
        </div>

        <Tabs defaultValue="this-year" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-secondary p-1">
            <TabsTrigger value="this-year" className="text-[11px] tracking-widest">☀️ This Year</TabsTrigger>
            <TabsTrigger value="moon" className="text-[11px] tracking-widest">☽ The Moon</TabsTrigger>
            <TabsTrigger value="profile" className="text-[11px] tracking-widest">🧠 Profile</TabsTrigger>
            <TabsTrigger value="time-lords" className="text-[11px] tracking-widest">⏳ Time Lords</TabsTrigger>
            <TabsTrigger value="life-areas" className="text-[11px] tracking-widest">🏡 Life Areas</TabsTrigger>
            <TabsTrigger value="planets" className="text-[11px] tracking-widest">🪐 Planets & Houses</TabsTrigger>
            <TabsTrigger value="aspects" className="text-[11px] tracking-widest">⚡ Aspects & Timing</TabsTrigger>
            <TabsTrigger value="relocation" className="text-[11px] tracking-widest">🗺️ Relocation</TabsTrigger>
          </TabsList>

          {/* Tier download row — T1–T5 tiers + Birthday Report + AI Reading */}
          <TierButtonRow
            analysis={analysis}
            natalChart={selectedNatal}
            solarReturnChart={selectedSR}
            onDownloadTier={handleTierDownload}
            onGenerateAiReading={() => setShowAiReading(true)}
          />
          {/* Tier preview: slide-in confirmation strip + detailed tier contents */}
          {activeTier && activeTier !== 'gift' && (
            <>
              <TierPreviewPanel
                tier={activeTier as 't1' | 't2' | 't3' | 't4' | 't5'}
                analysis={analysis}
                onClose={() => setActiveTier(null)}
                onDownload={() => handleBirthdayGiftExport()}
              />
              <div className="border border-border rounded-sm p-4 bg-card/60 mb-2">
                <TierPreviewContent
                  tier={activeTier as 't1' | 't2' | 't3' | 't4' | 't5'}
                  analysis={analysis}
                />
              </div>
            </>
          )}

          <AiReadingModal
            open={showAiReading}
            onClose={() => setShowAiReading(false)}
            personName={selectedNatal.name || 'Chart'}
            buildFullJson={() => buildFullJsonStandalone(analysis, selectedSR, selectedNatal, aiReadings)}
            onReadingsUpdate={(r) => setAiReadings(r)}
          />

          <TabsContent value="this-year">
            <ThisYearTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="moon">
            <TheMoonTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="time-lords">
            <TimeLordsTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="life-areas">
            <LifeAreasTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="planets">
            <PlanetsHousesTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="aspects">
            <AspectsTimingTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
          </TabsContent>

          <TabsContent value="relocation">
            <RelocationTab analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} srChartsForNatal={srChartsForNatal} />
          </TabsContent>
        </Tabs>
        </>
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
  const [location, setLocation] = useState(existingSR?.solarReturnLocation || '');
  const [srDateTime, setSrDateTime] = useState(existingSR?.solarReturnDateTime || '');
  const [planets, setPlanets] = useState<Record<string, { sign: string; degree: number; minutes: number; isRetrograde?: boolean }>>(
    existingSR?.planets ? { ...existingSR.planets } as any : {}
  );
  const [isAutoCalc, setIsAutoCalc] = useState(false);
  const [autoCalcError, setAutoCalcError] = useState<string | null>(null);
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
            chartType: 'solar-return',
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

  // ── Auto-Calculate Solar Return ────────────────────────────────────
  const handleAutoCalculate = () => {
    setAutoCalcError(null);

    // Need natal Sun position
    const natalSun = (natalChart.planets as any)?.Sun;
    if (!natalSun?.sign) {
      setAutoCalcError('Natal chart is missing the Sun position. Please enter your natal chart first.');
      return;
    }

    // Resolve lat/lng from location string or stored coordinates
    let lat: number | null = null;
    let lng: number | null = null;

    // Check for "lat, lng" coordinate format in location field
    const coordMatch = location.match(/([-]?\d+\.?\d*)\s*,\s*([-]?\d+\.?\d*)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else if (location.trim()) {
      const coords = getCoordinatesFromLocation(location);
      if (coords) { lat = coords.lat; lng = coords.lon; }
    }

    // Fall back to birth location if SR location not resolved
    if (lat === null || lng === null) {
      const birthCoordMatch = (natalChart.birthLocation || '').match(/([-]?\d+\.?\d*)\s*,\s*([-]?\d+\.?\d*)/);
      if (birthCoordMatch) {
        lat = parseFloat(birthCoordMatch[1]);
        lng = parseFloat(birthCoordMatch[2]);
      } else {
        const birthCoords = getCoordinatesFromLocation(natalChart.birthLocation || '');
        if (birthCoords) { lat = birthCoords.lat; lng = birthCoords.lon; }
      }
    }

    if (lat === null || lng === null) {
      setAutoCalcError('Could not determine location coordinates. Enter a city name or "lat, lng" coordinates in the SR Location field.');
      return;
    }

    setIsAutoCalc(true);
    try {
      const result = calculateSolarReturnAuto(
        natalSun.sign,
        natalSun.degree ?? 0,
        natalSun.minutes ?? 0,
        natalChart.birthDate || '',
        year,
        lat,
        lng,
      );

      setPlanets(result.planets as any);
      setHouseCusps(result.houseCusps as any);
      setSrDateTime(result.srDateTimeUTC);
      if (Object.keys(result.houseCusps).length > 0) setShowHouses(true);
      toast.success(`Solar return calculated: ${result.srDateTimeLabel}`);
    } catch (err: any) {
      setAutoCalcError(err?.message || 'Calculation failed. Check natal Sun position and year.');
    } finally {
      setIsAutoCalc(false);
    }
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
            {formatDateMMDDYYYY(natalChart.birthDate) || '—'}
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

      {/* Auto-Calculate button */}
      <div className="border border-primary/30 rounded-sm p-3 bg-primary/5 space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">Auto-Calculate from Astronomy</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Uses your natal Sun position + SR year/location to compute the exact solar return moment and all planet positions automatically.
            </p>
          </div>
          <button
            onClick={handleAutoCalculate}
            disabled={isAutoCalc}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isAutoCalc ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
            {isAutoCalc ? 'Calculating…' : 'Auto-Calculate SR'}
          </button>
        </div>
        {autoCalcError && (
          <p className="text-xs text-destructive">{autoCalcError}</p>
        )}
        {srDateTime && (
          <p className="text-[10px] text-primary">
            ☉ SR moment: {srDateTime.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}
          </p>
        )}
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
  // Compute executive summary
  const executiveSummary = useMemo(() => generateExecutiveSummary(analysis, natalChart), [analysis, natalChart]);

  // Compute action guidance
  const actionGuidance = useMemo(() => {
    const srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }> = {};
    for (const [key, val] of Object.entries(srChart.planets || {})) {
      if (val) srPlanets[key] = { sign: (val as any).sign, isRetrograde: (val as any).isRetrograde };
    }
    return generateActionGuidance(analysis.planetSRHouses, srPlanets);
  }, [analysis, srChart]);

  // Compute activation windows
  const activationData = useMemo(() => {
    const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const toAbs = (pos: any): number | null => {
      if (!pos?.sign) return null;
      const idx = SIGNS.indexOf(pos.sign);
      if (idx < 0) return null;
      return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
    };

    const srPositions: Record<string, number> = {};
    const keyTargets = ['Sun', 'Moon', 'Ascendant', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury'];
    for (const p of keyTargets) {
      const pos = srChart.planets?.[p as keyof typeof srChart.planets];
      const deg = pos ? toAbs(pos) : null;
      if (deg !== null) srPositions[p] = deg;
    }
    // Also add MC if available
    const mc = srChart.houseCusps?.house10;
    if (mc) {
      const mcDeg = toAbs(mc);
      if (mcDeg !== null) srPositions['MC'] = mcDeg;
    }

    const bd = natalChart.birthDate || '';
    const parts = bd.split('-');
    const bMonth = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
    const bDay = parts.length >= 3 ? parseInt(parts[2], 10) : 1;

    return calculateActivationWindows(srPositions, srChart.solarReturnYear, bMonth, bDay);
  }, [srChart, natalChart]);

  // Compute identity shift
  const identityShift = useMemo(() => generateIdentityShift(analysis, srChart, natalChart), [analysis, srChart, natalChart]);

  // Compute life domain scores
  const lifeDomainScores = useMemo(() => calculateLifeDomainScores(analysis), [analysis]);

  // Compute contradiction resolutions
  const contradictions = useMemo(() => detectContradictions(analysis, srChart), [analysis, srChart]);

  // Compute power portrait
  const powerPortrait = useMemo(() => generatePowerPortrait(analysis, natalChart, srChart), [analysis, natalChart, srChart]);

  // Compute domain deep dives (6 life areas)
  const domainDeepDives = useMemo(() => generateDomainDeepDives(analysis, natalChart, srChart), [analysis, natalChart, srChart]);

  // Compute lunar weather map
  const lunarWeather = useMemo(() => generateLunarWeatherMap(analysis, srChart, natalChart), [analysis, srChart, natalChart]);

  return (
    <div className="space-y-4 mt-4">
      {/* Executive Summary — Top Opportunities, Challenges, Core Focus */}
      <ExecutiveSummaryCard summary={executiveSummary} />

      {/* Identity Shift — Who you are becoming */}
      <IdentityShiftCard shift={identityShift} />

      {/* Power Portrait — drive, sustain, burnout, realignment */}
      <PowerPortraitCard portrait={powerPortrait} />

      {/* Dominant Planets — 5-factor scoring engine */}
      {analysis.dominantPlanets && (
        <DominantPlanetsCard report={analysis.dominantPlanets} context="solar-return" />
      )}

      {/* Life Domain Scores — 10 categories with tone-aware scoring */}
      <LifeDomainScoresCard scores={lifeDomainScores} />

      {/* Domain Deep Dives — multi-house synthesis per life area */}
      <DomainDeepDiveCards domains={domainDeepDives} />

      {/* 1. Story of the Year — top-level narrative synthesis */}
      <StoryOfTheYear analysis={analysis} natalChart={natalChart} srChart={srChart} />

      {/* 3. Natal Overlay — where this year lands in the natal chart */}
      <NatalOverlayCard analysis={analysis} />

      {/* 3b. Lands vs Plays Out — side-by-side comparison */}
      <LandsVsPlaysOutCard analysis={analysis} />

      {/* 4. Angle Activations — SR angles contacting natal planets */}
      <AngleActivationCard natalChart={natalChart} srChart={srChart} />

      {/* 5. Planet-to-Angle — SR planets contacting natal angles */}
      <PlanetToAngleCard natalChart={natalChart} srChart={srChart} />

      {/* 6. Psychological Profile — bipolar spectrums: natal, SR, blended */}
      <PsychologicalProfileCard natalChart={natalChart} srChart={srChart} />

      {/* Year Priority Engine removed — now covered by 10-domain Life Domain Scores above */}

      {/* 7. Your Year's Playbook — Action Guidance */}
      <ActionGuidanceCard guidance={actionGuidance} />

      {/* 8. Activation Timeline — When themes peak */}
      {activationData.transitHits.length > 0 && (
        <ActivationTimeline data={activationData} />
      )}

      {/* 9. Lunar Emotional Weather Map */}
      <LunarWeatherCard weather={lunarWeather} />

      {/* 10. Contradiction Resolution */}
      {contradictions.length > 0 && (
        <ContradictionCard contradictions={contradictions} />
      )}

      {/* Dashboard Details */}
      <SROverviewDashboard analysis={analysis} natalChart={natalChart} srChart={srChart} />

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

      {/* SR Ascendant Ruler in Natal Houses */}
      {analysis.srAscRulerInNatal && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
            <Compass size={16} className="text-primary" />
            Where This Year Plays Out in YOUR Life
          </h3>

          {/* Step-by-step logic so it's crystal clear */}
          <div className="bg-secondary/50 rounded-sm p-3 mb-4 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">How this works:</p>
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
          {analysis.profectionYear.overlap && analysis.profectionYear.overlapDescription && (
            <div className="mt-3 px-3 py-2 bg-primary/10 border border-primary/20 rounded-sm">
              <p className="text-xs text-primary font-medium">⚡ {analysis.profectionYear.overlapDescription}</p>
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
                  // For horizontal-axis houses (1,6,7,12), radial offsets barely
                  // change Y, so we offset PERPENDICULAR to the radius instead.
                  const isHorizontal = [1, 6, 7, 12].includes(houseNum);
                  const midRad = toRad(midAngle);
                  const cosM = Math.cos(midRad);
                  const sinM = Math.sin(midRad);
                  // Perpendicular unit vector (tangent, pointing "up" in wedge)
                  const perpX = sinM;  // rotated 90° from radial
                  const perpY = cosM;

                  const houseLabelR = r - 18;
                  // For horizontal houses, nudge the house label perpendicular
                  const hPerp = isHorizontal ? 14 : 0;
                  const hlx = cx + houseLabelR * cosM + perpX * hPerp;
                  const hly = cy - houseLabelR * sinM + perpY * hPerp;

                  // Age rows: use different radii AND perpendicular nudge
                  const agesR1 = (r + rInner) / 2 + 12;
                  const agesR2 = (r + rInner) / 2 - 12;
                  const agePerp = isHorizontal ? 10 : 0;
                  const a1x = cx + agesR1 * cosM + perpX * agePerp;
                  const a1y = cy - agesR1 * sinM + perpY * agePerp;
                  const a2x = cx + agesR2 * cosM - perpX * agePerp;
                  const a2y = cy - agesR2 * sinM - perpY * agePerp;
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
                <div className="bg-secondary/30 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Worth Knowing</p>
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

      {/* ── The Moon — Comprehensive Section ── */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-5">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Moon size={16} className="text-primary" />
          ☽ The Moon — Your Emotional Year
        </h3>

        {/* ── Hero: Moon placement at a glance ── */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-4xl">{SIGN_SYMBOLS[analysis.moonSign]}</span>
            <div>
              <p className="text-xl font-serif text-foreground">Moon in {analysis.moonSign}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {analysis.moonHouse.house && (
                  <span className="text-sm text-primary font-medium">SR House {analysis.moonHouse.house}</span>
                )}
                {(() => {
                  const moonPos = srChart.planets.Moon;
                  if (!moonPos) return null;
                  return <span className="text-xs text-muted-foreground">{moonPos.degree}° {moonPos.sign}</span>;
                })()}
                {analysis.moonAngularity && (
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium ${
                    analysis.moonAngularity === 'angular' ? 'bg-primary/10 text-primary' :
                    analysis.moonAngularity === 'succedent' ? 'bg-secondary text-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>{analysis.moonAngularity}</span>
                )}
                {analysis.moonLateDegree && (
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 font-medium">Late Degree</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            The Moon in your Solar Return is the single most important planet for understanding how you will <em>feel</em> this year. It does not move — it is a frozen snapshot of the emotional weather at the moment of your birthday. Everything below unpacks what this placement means for you.
          </p>
        </div>

        {/* ── Angularity Deep Teaching ── */}
        {analysis.moonHouse.house && (() => {
          const ang = srMoonAngularity(analysis.moonAngularity, analysis.moonHouse.house || 0);
          return (
            <div className="border border-border rounded-sm p-4 bg-muted/10 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-medium text-primary">{ang.position} Moon — What This Means</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{ang.meaning}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.moonAngularity === 'angular'
                  ? 'Angular Moons produce event-driven years. Your emotions are on the surface and trigger visible changes in your life. Other people can see what you are feeling. Major life events — moves, new relationships, career shifts — tend to correlate with angular Moon years.'
                  : analysis.moonAngularity === 'succedent'
                  ? 'Succedent Moons produce years of consolidation. You are building on what already exists rather than starting something new. Emotional satisfaction comes from deepening commitments — to a relationship, a creative project, a financial goal. Stability is the keyword.'
                  : 'Cadent Moons produce years of inner work. The most important changes happen inside you — shifts in perspective, processing old grief, spiritual breakthroughs. You may feel invisible or overlooked, but the growth happening beneath the surface is profound. Therapy, meditation, or artistic expression become essential.'}
              </p>
            </div>
          );
        })()}

        {/* ── Late Degree Teaching ── */}
        {analysis.moonLateDegree && (
          <div className="border border-amber-500/30 rounded-sm p-4 bg-amber-500/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-medium text-amber-600">Late-Degree Moon (25°+) — Completion Energy</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When the SR Moon falls in the final 5 degrees of a sign, you are at the <em>end</em> of an emotional chapter. Something that has been building for years reaches its conclusion. There is often a "been there, done that" quality — you may feel emotionally exhausted by themes connected to this sign's energy. This is not a crisis; it is a graduation. Next year's Moon will likely be in a new sign, bringing fresh emotional territory.
            </p>
          </div>
        )}

        {/* ── Moon Phase ── */}
        {analysis.moonPhase && (() => {
          const phaseInterp = srMoonPhaseInterp[analysis.moonPhase.phase];
          const sunSign = srChart.planets.Sun?.sign || '';
          const blending = getMoonPhaseBlending(
            analysis.moonPhase.phase,
            analysis.moonSign,
            sunSign,
            analysis.moonHouse?.house ?? null,
            analysis.sunHouse?.house ?? null,
          );
          return (
            <div className="border border-border rounded-sm p-4 bg-muted/10 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[10px] uppercase tracking-widest font-medium text-primary">SR Moon Phase</p>
                {analysis.moonPhase.isEclipse && (
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-destructive/10 text-destructive rounded-sm">Near Eclipse Axis</span>
                )}
              </div>
              <p className="text-base font-serif text-foreground">
                {analysis.moonPhase.phase}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {analysis.moonPhase.phaseAngle}° separation
                </span>
              </p>
              {phaseInterp && <p className="text-xs font-medium text-primary">{phaseInterp.theme}</p>}
              <p className="text-xs text-muted-foreground leading-relaxed">{phaseInterp?.description || analysis.moonPhase.description}</p>

              {/* Phase Narrative Summary */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Cycle Stage</p>
                  <p className="text-xs text-foreground font-medium">{blending.cycleStage}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Theme</p>
                  <p className="text-xs text-foreground font-medium">{blending.themeLabel}</p>
                </div>
              </div>

              {/* Sign Blending: What's releasing vs emerging */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-secondary/20 rounded-sm p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Releasing ({analysis.moonSign})</p>
                  <p className="text-xs text-foreground leading-relaxed">{blending.releasing}</p>
                </div>
                <div className="bg-accent/20 rounded-sm p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Emerging ({sunSign})</p>
                  <p className="text-xs text-foreground leading-relaxed">{blending.emerging}</p>
                </div>
              </div>

              {/* House Blending: Where closing vs incubating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-secondary/20 rounded-sm p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Focus Area Closing{analysis.moonHouse?.house ? ` · House ${analysis.moonHouse.house}` : ''}</p>
                  <p className="text-xs text-foreground leading-relaxed">{blending.areaClosing}</p>
                </div>
                <div className="bg-accent/20 rounded-sm p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">New Inner Direction{analysis.sunHouse?.house ? ` · House ${analysis.sunHouse.house}` : ''}</p>
                  <p className="text-xs text-foreground leading-relaxed">{blending.newDirection}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 29-Year Lunar Phase Timeline ── */}
        <LunarPhaseTimeline natalChart={natalChart} srChart={srChart} />

        {/* ── Moon Sign: Emotional Temperament ── */}
        {srMoonInSign[analysis.moonSign] && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Emotional Temperament — Moon in {analysis.moonSign}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{srMoonInSign[analysis.moonSign]}</p>
          </div>
        )}

        {/* ── Moon Sign Shift — Natal vs SR (4-Field Deep Card) ── */}
        {(() => {
          const natalMoonSign = natalChart.planets.Moon?.sign;
          const srMoonSign = analysis.moonSign;
          if (!natalMoonSign || !srMoonSign) return null;
          const natalDeep = moonSignDeep[natalMoonSign];
          const srDeep = moonSignDeep[srMoonSign];
          const shiftNarr = moonShiftNarrative[natalMoonSign]?.[srMoonSign];

          if (natalMoonSign === srMoonSign) {
            return (
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                <h4 className="text-[10px] uppercase tracking-widest text-primary mb-2">☽ Moon Stays in {natalMoonSign} — Emotional Continuity</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your SR Moon matches your natal Moon sign. This year reinforces your emotional instincts rather than challenging them. You feel at home in your own skin emotionally. Trust your gut more than usual — it is running on native software.
                </p>
                {natalDeep && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="bg-card border border-border rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Processing</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.emotional}</p>
                    </div>
                    <div className="bg-card border border-border rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Body Sensations</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.body}</p>
                    </div>
                    <div className="bg-card border border-border rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">How To Apply</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.apply}</p>
                    </div>
                    <div className="bg-card border border-border rounded-sm p-3">
                      <p className="text-[10px] uppercase tracking-widest text-primary mb-1">What It Looks Like</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.looksLike}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary/60 border-b border-border px-4 py-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Natal Moon</h4>
                    <p className="text-lg font-serif text-foreground flex items-center gap-2">
                      {SIGN_SYMBOLS[natalMoonSign]} {natalMoonSign}
                    </p>
                  </div>
                  {natalDeep && (
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Processing</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.emotional}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Body Sensations</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.body}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">How To Apply</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.apply}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">What It Looks Like</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{natalDeep.looksLike}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-primary/20 rounded-lg overflow-hidden">
                  <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-primary">This Year's Moon</h4>
                    <p className="text-lg font-serif text-foreground flex items-center gap-2">
                      {SIGN_SYMBOLS[srMoonSign]} {srMoonSign}
                    </p>
                  </div>
                  {srDeep && (
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Processing</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{srDeep.emotional}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Body Sensations</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{srDeep.body}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">How To Apply</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{srDeep.apply}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">What It Looks Like</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{srDeep.looksLike}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4">
                <h4 className="text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                  The Shift: {natalMoonSign} → {srMoonSign}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {shiftNarr || `Your natal ${natalMoonSign} Moon is your emotional home base: ${natalDeep?.emotional || ''} This year, the SR ${srMoonSign} Moon layers a completely different emotional frequency on top: ${srDeep?.emotional || ''}`}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── Moon House — Where Feelings Concentrate ── */}
        {analysis.moonHouse.house && srMoonInHouseDeep[analysis.moonHouse.house] && (() => {
          const deep = srMoonInHouseDeep[analysis.moonHouse.house];
          return (
            <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-medium text-primary">SR House {analysis.moonHouse.house} — Where Your Heart Lives This Year</span>
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

        {/* ── House Overlay ── */}
        {analysis.moonHouse.house && analysis.moonNatalHouse.house && analysis.moonHouse.house !== analysis.moonNatalHouse.house && (
          <div className="border border-border/50 rounded-sm p-3 bg-muted/10">
            <p className="text-[10px] uppercase tracking-widest text-primary mb-1">House Overlay — SR House {analysis.moonHouse.house} in Natal House {analysis.moonNatalHouse.house}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {srOverlayNarrative('The Moon', analysis.moonHouse.house, analysis.moonNatalHouse.house)}
            </p>
          </div>
        )}

        {/* ── Moon Void of Course (Unaspected) ── */}
        {analysis.moonVOC && (
          <div className="border-t border-border pt-4">
            <div className="border-2 border-amber-500/30 rounded-sm p-5 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌑</span>
                <h4 className="text-[10px] uppercase tracking-widest font-semibold text-amber-600 dark:text-amber-400">
                  Moon Void of Course — The Unaspected Moon
                </h4>
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                Your Solar Return Moon makes no major aspects to any other planet in the SR chart. This is a rare and significant condition.
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">What This Means</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    An unaspected SR Moon operates in isolation — your emotional life this year runs on its own track, without direct planetary support or challenge. Feelings are vivid but disconnected from the rest of the chart's story. You may feel emotionally "untethered" — deeply feeling but unsure what to do with those feelings, as if your inner life and outer circumstances are speaking different languages.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">The Gift</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Without planetary aspects pulling it in different directions, the Moon is free. Your emotional compass this year is entirely your own — uncorrupted by external pressures. This can bring a rare emotional clarity and independence. You trust your gut because nothing else is competing with it.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">The Challenge</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Without aspects to ground or activate the Moon, emotional needs may go unmet unless you consciously name and honor them. Others may not instinctively "get" what you need this year. You'll need to articulate your feelings rather than expecting the world to reflect them back to you.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">How to Work With It</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Journaling, therapy, and creative expression become essential outlets. The unaspected Moon often produces artists, writers, and deep feelers who channel emotion into form. Give your feelings a container — they won't find one automatically this year.
                  </p>
                </div>
              </div>
            </div>
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
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                  <Moon size={14} /> Moon Aspects Within the Solar Return
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  These are the planetary conversations your Moon is having <em>within</em> the SR chart. They describe the emotional texture of the entire year — not events, but the <em>feeling tone</em> that colors everything.
                </p>
              </div>
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
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                  <Moon size={14} /> SR Moon Touching Your Natal Planets
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1">
                  When the SR Moon aspects a natal planet, that natal planet's themes become emotionally charged all year. These are the parts of your birth chart that get <em>activated</em> by this year's emotional energy.
                </p>
              </div>
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

        {/* ── 19-Year Metonic Cycle ── */}
        {analysis.moonMetonicAges.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="border border-border/50 rounded-sm p-4 bg-muted/10 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-medium text-primary">The 19-Year Metonic Echo</p>
              {(() => {
                const age = analysis.profectionYear?.age ?? 0;
                const past = analysis.moonMetonicAges.filter(a => a < age);
                const future = analysis.moonMetonicAges.filter(a => a > age);
                return (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The Moon returns to the same zodiac sign approximately every 19 years (the Metonic cycle). You experience Moon in {analysis.moonSign} at these ages:
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {past.length > 0 && <><span className="text-muted-foreground">Past: </span><strong>{past.join(', ')}</strong></>}
                      {past.length > 0 && ' · '}
                      <span className="text-primary font-bold">Now: {age}</span>
                      {future.length > 0 && ' · '}
                      {future.length > 0 && <><span className="text-muted-foreground">Next: </span><strong>{future.join(', ')}</strong></>}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      Reflect on what was happening emotionally at those past ages. The same emotional themes are cycling back — but you are meeting them with everything you have learned since then. This is not repetition; it is a spiral.
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        )}
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

      {/* Moon Phase moved into Moon section above */}

      {/* SR Ascendant in Natal House */}
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
        </div>
      )}

      {/* Natal Degree Conduits */}
      {analysis.natalDegreeConduits.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <Target size={14} className="text-primary" /> Natal Degree Connections
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            When a Solar Return planet lands on the same degree as a natal planet (within 2°), it becomes a "conduit" — reawakening that natal energy all year. These are among the most significant indicators in a Solar Return.
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

      {/* Emotional Climate data now merged into Moon section above */}

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
            The Vertex is the intersection of the Prime Vertical with the Ecliptic — it marks where destiny, fated encounters, and events beyond conscious control enter your life.
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

      {/* ── Planet Spotlight — Beautiful Cards ── */}
      {(() => {
        const deepData: Record<string, Record<number, SRPlanetHouseDeep>> = {
          Mercury: srMercuryInHouseDeep,
          Venus: srVenusInHouseDeep,
          Mars: srMarsInHouseDeep,
          Jupiter: srJupiterInHouseDeep,
          Saturn: srSaturnInHouseDeep,
          Uranus: srUranusInHouseDeep,
          Neptune: srNeptuneInHouseDeep,
          Pluto: srPlutoInHouseDeep,
        };
        const spotlightPlanets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].filter(p => {
          const h = analysis.planetSRHouses[p];
          return h !== null && h !== undefined && deepData[p]?.[h];
        });
        if (spotlightPlanets.length === 0) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">
                Planet Spotlight — Expert Analysis
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Deep interpretations for each planet in your Solar Return houses. These describe how that planet's energy specifically manifests for you this year.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spotlightPlanets.map(planet => {
                const h = analysis.planetSRHouses[planet]!;
                const data = deepData[planet][h];
                if (!data) return null;
                const overlay = analysis.houseOverlays.find(o => o.planet === planet);
                return (
                  <div key={planet} className="border border-primary/15 rounded-lg bg-gradient-to-br from-card to-secondary/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Header bar with planet symbol */}
                    <div className="bg-primary/8 border-b border-primary/10 px-4 py-3 flex items-center gap-3">
                      <span className="text-2xl">{PLANET_SYMBOLS[planet]}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{planet} in SR House {h}</h4>
                        {overlay?.natalHouse && overlay.natalHouse !== h && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ArrowRight size={10} /> Natal House {overlay.natalHouse}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-primary">{data.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{data.overview}</p>
                      <div className="bg-secondary/40 rounded-sm p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Practical Manifestation</p>
                        <p className="text-xs text-foreground leading-relaxed">{data.practical}</p>
                      </div>
                      <div className="bg-destructive/5 border border-destructive/10 rounded-sm p-3">
                        <p className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-1">Caution</p>
                        <p className="text-xs text-foreground leading-relaxed">{data.caution}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
              { label: 'Upper', value: analysis.hemisphericEmphasis.upper, desc: 'Houses 7–12 · Other-directed', planets: analysis.hemisphericEmphasis.upperPlanets },
              { label: 'Lower', value: analysis.hemisphericEmphasis.lower, desc: 'Houses 1–6 · Self-directed', planets: analysis.hemisphericEmphasis.lowerPlanets },
              { label: 'East', value: analysis.hemisphericEmphasis.east, desc: 'Houses 10–3 · Initiating', planets: analysis.hemisphericEmphasis.eastPlanets },
              { label: 'West', value: analysis.hemisphericEmphasis.west, desc: 'Houses 4–9 · Responsive', planets: analysis.hemisphericEmphasis.westPlanets },
            ].map(item => (
              <div key={item.label} className="border border-border rounded-sm p-2 bg-muted/30">
                <div className="text-lg font-semibold text-foreground">{item.value}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{item.label}</div>
                <div className="text-[9px] text-muted-foreground/70">{item.desc}</div>
                {item.planets && item.planets.length > 0 && (
                  <div className="text-[8px] text-primary mt-1 leading-snug">
                    {item.planets.join(', ')}
                  </div>
                )}
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

const RelocationTab = ({ analysis, srChart, natalChart, srChartsForNatal }: {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  srChartsForNatal: SolarReturnChart[];
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
            📍 This SR Chart Was Relocated
          </h4>
          <p className="text-sm text-muted-foreground">
            Birth location: <strong>{capitalizeLocation(natalChart.birthLocation || '')}</strong> → SR location: <strong>{capitalizeLocation(srChart.solarReturnLocation)}</strong>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            The planets are identical — only the house cusps and angles shift based on where you were for your Solar Return.
          </p>
        </div>
      )}

      {/* Astrocartography Heat Map */}
      <AstrocartographyMap srChart={srChart} natalChart={natalChart} />
    </div>
  );
};
