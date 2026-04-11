import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS, ordinal } from '@/lib/solarReturnConstants';
import { buildHouseEmphasis } from '@/lib/solarReturnHouseEmphasis';
import { buildFinalAdvice } from '@/lib/solarReturnFinalAdvice';
import { generateExecutiveSummary } from '@/lib/solarReturnExecutiveSummary';
import { scoreAspects, generateTopThemes } from '@/lib/solarReturnAspectScoring';
import { srSunInHouse, srMoonInSign, srMoonInHouse, srOverlayNarrative, rulerConditionNarrative } from '@/lib/solarReturnInterpretations';
import { generatePlotNarrative, generateSettingNarrative } from '@/lib/solarReturnRulerNarratives';
import { ExecutiveSummaryCard } from '@/components/solarReturn/ExecutiveSummaryCard';
import { StoryOfTheYear } from '@/components/solarReturn/StoryOfTheYear';
import { Sun, Compass } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const ThisYearTab = ({ analysis, srChart, natalChart }: Props) => {
  const executiveSummary = useMemo(() => generateExecutiveSummary(analysis, natalChart), [analysis, natalChart]);
  const houseEmphasis = useMemo(() => buildHouseEmphasis(analysis), [analysis]);
  const finalAdvice = useMemo(() => buildFinalAdvice(analysis, natalChart, srChart), [analysis, natalChart, srChart]);
  const topThemes = useMemo(() => {
    const bMonth = natalChart.birthDate ? parseInt(natalChart.birthDate.slice(5, 7), 10) - 1 : 0;
    return generateTopThemes(scoreAspects(analysis.srToNatalAspects || [], bMonth));
  }, [analysis, natalChart]);

  return (
    <div className="space-y-6 mt-4">
      {/* Executive Summary */}
      <ExecutiveSummaryCard summary={executiveSummary} />

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
                {analysis.yearlyTheme.ascendantRulerHouse && ` (${ordinal(analysis.yearlyTheme.ascendantRulerHouse)} house)`}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.yearlyTheme.yearTheme}</p>
          {analysis.lordOfTheYear && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Chart Ruler Condition:</strong> {rulerConditionNarrative(analysis.lordOfTheYear.dignity, analysis.lordOfTheYear.isRetrograde)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sun & Moon Placements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sun */}
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">☉ Sun Placement</h4>
          {analysis.sunHouse.house ? (
            <>
              <p className="text-sm font-medium text-foreground mb-1">SR House {analysis.sunHouse.house}</p>
              {analysis.sunNatalHouse.house && analysis.sunNatalHouse.house !== analysis.sunHouse.house && (
                <p className="text-xs text-muted-foreground mb-2">→ lands in natal {ordinal(analysis.sunNatalHouse.house)} house</p>
              )}
              {srSunInHouse[analysis.sunHouse.house] && (
                <>
                  <p className="text-base font-serif text-foreground mb-2">{srSunInHouse[analysis.sunHouse.house].title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{srSunInHouse[analysis.sunHouse.house].overview}</p>
                  <div className="bg-primary/5 rounded-sm p-3 mb-2">
                    <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Focus</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{srSunInHouse[analysis.sunHouse.house].focus}</p>
                  </div>
                </>
              )}
              {analysis.sunNatalHouse.house && analysis.sunNatalHouse.house !== analysis.sunHouse.house && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-t border-border pt-2">
                  {srOverlayNarrative('The Sun', analysis.sunHouse.house, analysis.sunNatalHouse.house)}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Add house cusps to see placement.</p>
          )}
        </div>
        {/* Moon */}
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">☽ Moon Placement</h4>
          <p className="text-sm font-medium text-foreground mb-1">Moon in {analysis.moonSign}</p>
          {analysis.moonHouse.house && (
            <p className="text-xs text-muted-foreground mb-1">SR House {analysis.moonHouse.house}</p>
          )}
          {analysis.moonNatalHouse.house && analysis.moonNatalHouse.house !== analysis.moonHouse.house && (
            <p className="text-xs text-muted-foreground mb-2">→ lands in natal {ordinal(analysis.moonNatalHouse.house)} house</p>
          )}
          {srMoonInSign[analysis.moonSign] && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">{srMoonInSign[analysis.moonSign]}</p>
          )}
          {analysis.moonHouse.house && srMoonInHouse[analysis.moonHouse.house] && (
            <div className="bg-primary/5 rounded-sm p-3 mb-2">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Focus</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{srMoonInHouse[analysis.moonHouse.house]}</p>
            </div>
          )}
          {analysis.moonNatalHouse.house && analysis.moonNatalHouse.house !== analysis.moonHouse.house && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2 border-t border-border pt-2">
              {srOverlayNarrative('The Moon', analysis.moonHouse.house, analysis.moonNatalHouse.house)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-2 italic">See the ☽ Moon tab for the full emotional year analysis.</p>
        </div>
      </div>

      {/* SR Ascendant Ruler — Both Layers */}
      {analysis.srAscRulerInNatal && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3 flex items-center gap-2">
            <Compass size={16} className="text-primary" />
            Where This Year Plays Out
          </h3>

          {/* Teaching explainer */}
          <div className="bg-secondary/30 rounded-sm p-3 mb-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The SR Ascendant ruler appears in <strong>two charts at once</strong>. In the Solar Return chart it shows the <em>energy and style</em> of your year — how things feel. In your natal chart it shows the <em>life area</em> that gets activated — where things happen. Think of it like a movie: the SR placement is the plot, and the natal placement is the setting.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-secondary/50 rounded-sm p-3 mb-4 space-y-1.5">
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Step 1:</span> SR Ascendant is {SIGN_SYMBOLS[analysis.srAscRulerInNatal.srAscSign] || ''} <strong>{analysis.srAscRulerInNatal.srAscSign}</strong>
            </p>
            <p className="text-xs text-foreground">
              <span className="text-primary font-semibold">Step 2:</span> Ruled by <strong>{PLANET_SYMBOLS[analysis.srAscRulerInNatal.rulerPlanet]} {analysis.srAscRulerInNatal.rulerPlanet}</strong>
            </p>
          </div>

          {/* Two-layer display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* SR Chart layer */}
            <div className="bg-primary/5 border border-primary/10 rounded-sm p-3">
              <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">🎬 The Plot — How This Year Feels</p>
              <p className="text-xs font-medium text-foreground mb-2">
                {PLANET_SYMBOLS[analysis.srAscRulerInNatal.rulerPlanet]} {analysis.srAscRulerInNatal.rulerPlanet} in {SIGN_SYMBOLS[analysis.srAscRulerInNatal.rulerSRSign] || ''} {analysis.srAscRulerInNatal.rulerSRSign}
                {analysis.srAscRulerInNatal.rulerSRHouse && <> · SR {ordinal(analysis.srAscRulerInNatal.rulerSRHouse)} house</>}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {generatePlotNarrative(analysis.srAscRulerInNatal.rulerPlanet, analysis.srAscRulerInNatal.rulerSRSign, analysis.srAscRulerInNatal.rulerSRHouse)}
              </p>
            </div>

            {/* Natal Chart layer */}
            <div className="bg-secondary/50 border border-border rounded-sm p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">📍 The Setting — Where It Lands In Your Life</p>
              <p className="text-xs font-medium text-foreground mb-2">
                {PLANET_SYMBOLS[analysis.srAscRulerInNatal.rulerPlanet]} {analysis.srAscRulerInNatal.rulerPlanet} in {SIGN_SYMBOLS[analysis.srAscRulerInNatal.rulerNatalSign] || ''} {analysis.srAscRulerInNatal.rulerNatalSign}
                {analysis.srAscRulerInNatal.rulerNatalHouse && <> · natal {ordinal(analysis.srAscRulerInNatal.rulerNatalHouse)} house</>}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {generateSettingNarrative(analysis.srAscRulerInNatal.rulerPlanet, analysis.srAscRulerInNatal.rulerNatalSign, analysis.srAscRulerInNatal.rulerNatalHouse)}
              </p>
            </div>
          </div>

          {/* Combined interpretation */}
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.srAscRulerInNatal.interpretation}</p>
        </div>
      )}

      {/* Story of the Year */}
      <StoryOfTheYear analysis={analysis} natalChart={natalChart} srChart={srChart} />

      {/* Top Themes */}
      {topThemes.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">Top Themes This Year</h3>
          <div className="space-y-3">
            {topThemes.map((t, i) => (
              <div key={i} className="bg-secondary/30 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">#{i + 1}</span>
                  <span className="text-sm font-medium text-foreground">{t.theme}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">importance: {t.importance}/10</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* House Emphasis */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">House Emphasis</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{houseEmphasis.summary}</p>
        <div className="grid grid-cols-3 gap-2">
          {houseEmphasis.mostActiveHouses.map(h => (
            <div key={h} className="bg-primary/10 border border-primary/20 rounded-sm p-3 text-center">
              <p className="text-lg font-serif text-primary">House {h}</p>
              <p className="text-[10px] text-muted-foreground">{houseEmphasis.themes[String(h)]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Advice */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">How to Use This Year</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{finalAdvice.howToUseThisYear}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-primary/5 rounded-sm p-3">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">Lean Into</p>
            <ul className="space-y-1">
              {finalAdvice.leanInto.map((item, i) => (
                <li key={i} className="text-xs text-foreground leading-relaxed">✦ {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-destructive/5 rounded-sm p-3">
            <p className="text-[10px] uppercase tracking-widest text-destructive font-medium mb-2">Avoid</p>
            <ul className="space-y-1">
              {finalAdvice.avoid.map((item, i) => (
                <li key={i} className="text-xs text-foreground leading-relaxed">⚠ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-secondary/30 rounded-sm p-3">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">Best Timing</p>
            <ul className="space-y-1">
              {finalAdvice.bestTiming.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">📅 {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-secondary/30 rounded-sm p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Most Intense Months</p>
            <ul className="space-y-1">
              {finalAdvice.mostIntenseMonths.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">🔥 {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 text-center">
          <p className="text-sm text-foreground font-serif italic leading-relaxed">{finalAdvice.closingMessage}</p>
        </div>
      </div>
    </div>
  );
};
