import { Button } from "@/components/ui/button";
import { VerifiedYearSynthesis } from '@/components/solarReturn/VerifiedYearSynthesis';
import { SR_REPORT_VERSION, resolveSolarReturnProvenance } from '@/lib/solarReturnProvenance';
import { ordinal as ordinalNumber } from '@/lib/interpretation/ordinals';
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
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
import { YearStoryPanel } from '@/components/solarReturn/YearStoryPanel';
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
import { calculateSolarReturnForChart } from '@/lib/solarReturnAutoCalculator';
import { resolveBirthPlace } from '@/lib/geo/birthPlace';
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

  const selectedNatal = allCharts.find(c => c.id === selectedNatalId) || null;

  const srChartsForNatal = selectedNatal ? getSolarReturnsForChart(selectedNatal.id) : [];

  const [selectedSRId, setSelectedSRId] = useState<string | null>(null);
  // Auto-select the most recent SR when nothing is selected so the analysis
  // renders without requiring the user to click the row first.
  const effectiveSRId = useMemo(() => {
    if (selectedSRId && srChartsForNatal.some(c => c.id === selectedSRId)) return selectedSRId;
    if (srChartsForNatal.length === 0) return null;
    return [...srChartsForNatal].sort((a, b) => b.solarReturnYear - a.solarReturnYear)[0].id;
  }, [selectedSRId, srChartsForNatal]);
  const selectedSR = srChartsForNatal.find(c => c.id === effectiveSRId) || null;

  const [showInputForm, setShowInputForm] = useState(false);
  const [editingSRId, setEditingSRId] = useState<string | null>(null);
  const [showAiReading, setShowAiReading] = useState(false);
  const [aiReadings, setAiReadings] = useState<{ plain: string; astro: string }>({ plain: '', astro: '' });
  useEffect(() => {
    abortExportRef.current?.abort();
    setAiReadings({ plain: '', astro: '' });
    setShowAiReading(false);
  }, [selectedNatal?.id, selectedSR?.id, selectedSR?.solarReturnDateTime]);
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
        // Keep invalid/failed output out of the exported report.
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

      {/* Header & person picker — every natal chart must remain selectable,
          including people who do not have a Solar Return chart yet. */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Solar Return:</label>
        {allCharts.length > 0 ? (
          <select
            value={selectedNatalId}
            onChange={(e) => { setSelectedNatalId(e.target.value); setSelectedSRId(null); }}
            className="border border-border bg-background text-foreground rounded-sm px-3 py-1.5 text-sm"
          >
            {allCharts.map(c => (
              <option key={c.id} value={c.id}>
                {c.id === userNatalChart?.id ? `★ ${c.name}` : c.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-muted-foreground">No natal charts yet</span>
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
          <div className="flex flex-col gap-2">
            {srChartsForNatal.sort((a, b) => b.solarReturnYear - a.solarReturnYear).map(sr => {
              const asc = (sr.houseCusps as Record<string, { sign: string; degree: number; minutes: number }> | undefined)?.house1;
              const sun = (sr.planets as Record<string, { sign: string; degree: number; minutes: number }> | undefined)?.Sun;
              const isActive = effectiveSRId === sr.id;
              return (
                <div
                  key={sr.id}
                  className={`flex items-center justify-between gap-3 rounded-sm border p-3 transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary'
                      : 'bg-secondary/40 border-border hover:border-primary'
                  }`}
                >
                  <button
                    onClick={() => setSelectedSRId(sr.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">SR {sr.solarReturnYear}</span>
                      <span className="text-xs text-muted-foreground">
                        📍 {sr.solarReturnLocation || '— no location —'}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                      {sun && <span>☉ Sun {sun.degree}°{String(sun.minutes).padStart(2,'0')}' {sun.sign}</span>}
                      {asc && <span>↑ ASC {asc.degree}°{String(asc.minutes).padStart(2,'0')}' {asc.sign}</span>}
                      {sr.solarReturnDateTime && <span>🕒 {new Date(sr.solarReturnDateTime).toUTCString().replace(' GMT', ' UTC')}</span>}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setEditingSRId(sr.id);
                      setShowInputForm(true);
                    }}
                    className="text-[11px] uppercase tracking-widest px-2 py-1 rounded-sm border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete SR ${sr.solarReturnYear} (${sr.solarReturnLocation || 'no location'}) for ${selectedNatal.name}?`)) {
                        deleteSolarReturn(sr.id);
                        if (selectedSRId === sr.id) setSelectedSRId(null);
                      }
                    }}
                    className="text-[11px] uppercase tracking-widest px-2 py-1 rounded-sm border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors shrink-0"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input form modal */}
      {showInputForm && (
        <SRInputForm
          natalChart={selectedNatal}
          existingSR={editingSRId ? srChartsForNatal.find(c => c.id === editingSRId) : undefined}
          existingSRYears={srChartsForNatal
            .filter(c => c.id !== editingSRId)
            .map(c => c.solarReturnYear)}
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
        <VerifiedYearSynthesis analysis={analysis} srChart={selectedSR} natalChart={selectedNatal} />
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
            key={`${selectedNatal.id}:${selectedSR.id}:${SR_REPORT_VERSION}`}
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
  existingSRYears?: number[];
  onSave: (sr: Partial<SolarReturnChart>) => void;
  onCancel: () => void;
}

const SRInputForm = ({ natalChart, existingSR, existingSRYears = [], onSave, onCancel }: SRInputFormProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(existingSR?.solarReturnYear || currentYear);
  const [location, setLocation] = useState(existingSR?.solarReturnLocation || '');
  const [srDateTime, setSrDateTime] = useState(existingSR?.solarReturnDateTime || '');
  const [calculationMetadata, setCalculationMetadata] = useState<{ targetLongitude: number; residualDegrees: number; ephemeris: unknown } | null>(null);
  const [calculatedPlace, setCalculatedPlace] = useState<{ latitude: number; longitude: number } | null>(null);
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
      [name]: { ...prev[name], ...(['sign', 'degree', 'minutes'].includes(field) ? { longitude: undefined, seconds: 0 } : {}), sign: prev[name]?.sign || 'Aries', degree: prev[name]?.degree || 0, minutes: prev[name]?.minutes || 0, [field]: value }
    }));
  };

  const updateHouse = (num: number, field: string, value: any) => {
    const key = `house${num}`;
    setHouseCusps(prev => ({
      ...prev,
      [key]: { ...prev[key], longitude: undefined, seconds: 0, sign: prev[key]?.sign || 'Aries', degree: prev[key]?.degree || 0, minutes: prev[key]?.minutes || 0, [field]: value }
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
        // Only trust an explicit SR/progression date — never fall back to birthDate,
        // which on an SR chart image is the NATAL birth date and would set year to e.g. 1969.
        const srDateStr = birthInfo.progressionDate || birthInfo.solarReturnDate || birthInfo.chartDate;
        if (srDateStr && /^\d{4}/.test(srDateStr)) {
          const parsedYear = parseInt(srDateStr.slice(0, 4), 10);
          const natalYear = natalChart.birthDate ? parseInt(String(natalChart.birthDate).slice(0, 4), 10) : NaN;
          if (parsedYear > 1900 && parsedYear < 2100 && parsedYear !== natalYear) {
            setYear(parsedYear);
          }
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
  const handleAutoCalculate = async () => {
    setAutoCalcError(null);

    // Need natal Sun position
    const natalSun = (natalChart.planets as any)?.Sun;
    if (!natalSun?.sign) {
      setAutoCalcError('Natal chart is missing the Sun position. Please enter your natal chart first.');
      return;
    }

    // Only the explicitly supplied physical return location may set houses.
    let lat: number | null = null;
    let lng: number | null = null;
    let placeNote = '';
    const coordMatch = location.match(/^\s*([-]?\d+\.?\d*)\s*,\s*([-]?\d+\.?\d*)\s*$/);
    if (coordMatch) { lat = Number(coordMatch[1]); lng = Number(coordMatch[2]); }
    else if (location.trim()) {
      setIsAutoCalc(true);
      try {
        const place = await resolveBirthPlace(location);
        if (place && !place.ambiguous && place.confidence !== 'low') {
          lat = place.latitude; lng = place.longitude; placeNote = place.canonicalName;
        } else {
          setAutoCalcError('That return location is not precise enough. Enter coordinates or a more specific town.');
          setIsAutoCalc(false); return;
        }
      } catch { setAutoCalcError('The return location could not be verified.'); setIsAutoCalc(false); return; }
    }
    if (placeNote) toast.message(`Solar return location: ${placeNote}`);

    setIsAutoCalc(true);
    try {
      const result = calculateSolarReturnForChart(natalChart, year, lat !== null && lng !== null ? { latitude: lat, longitude: lng } : null);

      setPlanets(result.planets as any);
      setHouseCusps(result.houseCusps as any);
      setSrDateTime(result.srDateTimeUTC);
      setCalculationMetadata({ targetLongitude: result.targetLongitude, residualDegrees: result.residualDegrees, ephemeris: result.ephemeris });
      setCalculatedPlace(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : null);
      if (!result.housesAvailable) toast.message('Planets calculated. Houses and angles are unavailable until you supply the return location.');
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
    if (existingSRYears.includes(year)) {
      toast.error(`A Solar Return for ${year} already exists for ${natalChart.name}. Pick a different year or edit the existing one.`);
      return;
    }
    onSave({
      name: `SR ${year}: ${natalChart.name}`,
      birthDate: natalChart.birthDate,
      birthTime: srDateTime || natalChart.birthTime,
      birthLocation: location,
      solarReturnYear: year,
      solarReturnLocation: location,
      solarReturnDateTime: srDateTime,
      ...(calculationMetadata ? { calculationMetadata } : {}),
      ...(calculatedPlace ? { ...calculatedPlace, houseSystem: 'placidus' as const } : {}),
      planets: planets as any,
      houseCusps: Object.keys(houseCusps).length > 0 ? houseCusps as any : undefined,
    });
  };

  const renderPlanetRow = (planet: string) => (
    <div key={planet} className="flex items-center gap-2 bg-secondary/30 rounded-sm p-2">
      <span className="w-8 shrink-0 text-center text-sm">{PLANET_SYMBOLS[planet] || planet.slice(0, 3)}</span>
      <span className="hidden sm:block w-20 shrink-0 text-xs text-muted-foreground truncate">{planet}</span>
      <select
        value={planets[planet]?.sign || ''}
        onChange={(e) => updatePlanet(planet, 'sign', e.target.value)}
        className="flex-1 min-w-0 border border-border bg-background text-foreground rounded-sm px-2 py-1 text-xs"
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
            className={`w-full border bg-background text-foreground rounded-sm px-3 py-2 text-sm ${
              existingSRYears.includes(year) ? 'border-destructive' : 'border-border'
            }`}
          />
          {existingSRYears.includes(year) && (
            <p className="text-[10px] text-destructive mt-1">
              ⚠ A Solar Return for {year} already exists for {natalChart.name}. Pick a different year, or cancel and edit the existing one.
            </p>
          )}
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">SR Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Physical location at the return, or leave blank for planets only"
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
          <Button
            onClick={handleAutoCalculate}
            disabled={isAutoCalc}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isAutoCalc ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />}
            {isAutoCalc ? 'Calculating…' : 'Auto-Calculate SR'}
          </Button>
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
