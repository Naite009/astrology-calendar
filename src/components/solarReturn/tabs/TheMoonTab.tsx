import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS } from '@/lib/solarReturnConstants';
import { srMoonInSign, srOverlayNarrative } from '@/lib/solarReturnInterpretations';
import { srMoonInHouseDeep, srMoonPhaseInterp, srMoonAngularity, srMoonAspects, getMoonPhaseBlending } from '@/lib/solarReturnMoonData';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';
import { generateLunarWeatherMap } from '@/lib/solarReturnLunarWeather';
import { LunarPhaseTimeline } from '@/components/solarReturn/LunarPhaseTimeline';
import { LunarWeatherCard } from '@/components/solarReturn/LunarWeatherCard';
import { Moon } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const TheMoonTab = ({ analysis, srChart, natalChart }: Props) => {
  const lunarWeather = useMemo(() => generateLunarWeatherMap(analysis, srChart, natalChart), [analysis, srChart, natalChart]);

  const natalMoonSign = natalChart.planets.Moon?.sign;
  const srMoonSign = analysis.moonSign;
  const natalDeep = natalMoonSign ? moonSignDeep[natalMoonSign] : null;
  const srDeep = srMoonSign ? moonSignDeep[srMoonSign] : null;
  const shiftNarr = natalMoonSign && srMoonSign ? moonShiftNarrative[natalMoonSign]?.[srMoonSign] : null;

  return (
    <div className="space-y-6 mt-4">
      {/* Hero: Moon placement */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-4xl">{SIGN_SYMBOLS[analysis.moonSign]}</span>
          <div>
            <p className="text-xl font-serif text-foreground">Moon in {analysis.moonSign}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {analysis.moonHouse.house && (
                <span className="text-sm text-primary font-medium">SR House {analysis.moonHouse.house}</span>
              )}
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
          The Moon in your Solar Return is the single most important planet for understanding how you will <em>feel</em> this year.
        </p>
      </div>

      {/* Angularity */}
      {analysis.moonHouse.house && (() => {
        const ang = srMoonAngularity(analysis.moonAngularity, analysis.moonHouse.house || 0);
        return (
          <div className="border border-border rounded-sm p-4 bg-muted/10 space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-medium text-primary">{ang.position} Moon</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{ang.meaning}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {analysis.moonAngularity === 'angular'
                ? 'Angular Moons produce event-driven years. Your emotions are on the surface and trigger visible changes.'
                : analysis.moonAngularity === 'succedent'
                ? 'Succedent Moons produce years of consolidation. Emotional satisfaction comes from deepening commitments.'
                : 'Cadent Moons produce years of inner work. The most important changes happen inside you.'}
            </p>
          </div>
        );
      })()}

      {/* Late Degree */}
      {analysis.moonLateDegree && (
        <div className="border border-amber-500/30 rounded-sm p-4 bg-amber-500/5 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-medium text-amber-600">Late-Degree Moon (25°+) — Completion Energy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You are at the <em>end</em> of an emotional chapter. Something building for years reaches its conclusion. This is not a crisis; it is a graduation.
          </p>
        </div>
      )}

      {/* Moon Phase */}
      {analysis.moonPhase && (() => {
        const phaseInterp = srMoonPhaseInterp[analysis.moonPhase.phase];
        const sunSign = srChart.planets.Sun?.sign || '';
        const blending = getMoonPhaseBlending(analysis.moonPhase.phase, analysis.moonSign, sunSign, analysis.moonHouse?.house ?? null, analysis.sunHouse?.house ?? null);
        return (
          <div className="border border-border rounded-sm p-4 bg-muted/10 space-y-4">
            <p className="text-base font-serif text-foreground">
              {analysis.moonPhase.phase}
              <span className="ml-2 text-xs text-muted-foreground">{analysis.moonPhase.phaseAngle}° separation</span>
            </p>
            {analysis.moonPhase.isEclipse && (
              <span className="text-[10px] uppercase px-2 py-0.5 bg-destructive/10 text-destructive rounded-sm">Near Eclipse Axis</span>
            )}
            {phaseInterp && <p className="text-xs font-medium text-primary">{phaseInterp.theme}</p>}
            <p className="text-xs text-muted-foreground leading-relaxed">{phaseInterp?.description || analysis.moonPhase.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div><p className="text-[10px] uppercase tracking-widest text-primary font-medium">Cycle Stage</p><p className="text-xs text-foreground">{blending.cycleStage}</p></div>
              <div><p className="text-[10px] uppercase tracking-widest text-primary font-medium">Theme</p><p className="text-xs text-foreground">{blending.themeLabel}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-secondary/20 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Releasing ({analysis.moonSign})</p>
                <p className="text-xs text-foreground leading-relaxed">{blending.releasing}</p>
              </div>
              <div className="bg-accent/20 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Emerging ({sunSign})</p>
                <p className="text-xs text-foreground leading-relaxed">{blending.emerging}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lunar Phase Timeline */}
      <LunarPhaseTimeline natalChart={natalChart} srChart={srChart} />

      {/* Moon Sign Temperament */}
      {srMoonInSign[analysis.moonSign] && (
        <div className="border border-border rounded-sm p-4">
          <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Emotional Temperament — Moon in {analysis.moonSign}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{srMoonInSign[analysis.moonSign]}</p>
        </div>
      )}

      {/* Moon Sign Shift */}
      {natalMoonSign && srMoonSign && natalMoonSign !== srMoonSign && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {natalDeep && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-secondary/60 border-b border-border px-4 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Natal Moon</p>
                  <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[natalMoonSign]} {natalMoonSign}</p>
                </div>
                <div className="p-4 space-y-2">
                  <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Processing</p><p className="text-xs text-muted-foreground">{natalDeep.emotional}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Body Sensations</p><p className="text-xs text-muted-foreground">{natalDeep.body}</p></div>
                </div>
              </div>
            )}
            {srDeep && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-primary">This Year's Moon</p>
                  <p className="text-lg font-serif text-foreground">{SIGN_SYMBOLS[srMoonSign]} {srMoonSign}</p>
                </div>
                <div className="p-4 space-y-2">
                  <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Processing</p><p className="text-xs text-muted-foreground">{srDeep.emotional}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Body Sensations</p><p className="text-xs text-muted-foreground">{srDeep.body}</p></div>
                </div>
              </div>
            )}
          </div>
          <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-primary mb-2">The Shift: {natalMoonSign} → {srMoonSign}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {shiftNarr || `Your natal ${natalMoonSign} Moon is your emotional home. This year, the SR ${srMoonSign} Moon layers a different emotional frequency on top.`}
            </p>
          </div>
        </div>
      )}

      {natalMoonSign === srMoonSign && natalDeep && (
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">☽ Moon Stays in {natalMoonSign} — Emotional Continuity</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Your SR Moon matches your natal Moon sign. This year reinforces your emotional instincts. Trust your gut.</p>
        </div>
      )}

      {/* Moon House Deep */}
      {analysis.moonHouse.house && srMoonInHouseDeep[analysis.moonHouse.house] && (() => {
        const deep = srMoonInHouseDeep[analysis.moonHouse.house];
        return (
          <div className="border border-border rounded-sm p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-medium text-primary">SR House {analysis.moonHouse.house} — {deep.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{deep.overview}</p>
            <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Emotional Theme</p><p className="text-xs text-muted-foreground">{deep.emotionalTheme}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Focus</p><p className="text-[11px] text-muted-foreground">{deep.focus}</p></div>
              <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Caution</p><p className="text-[11px] text-muted-foreground">{deep.caution}</p></div>
            </div>
          </div>
        );
      })()}

      {/* Moon VOC */}
      {analysis.moonVOC && (
        <div className="border-2 border-amber-500/30 rounded-sm p-5 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌑</span>
            <h4 className="text-[10px] uppercase tracking-widest font-semibold text-amber-600">Moon Void of Course — Unaspected Moon</h4>
          </div>
          <p className="text-sm text-foreground leading-relaxed font-medium">Your SR Moon makes no major aspects. This is rare and significant.</p>
          <p className="text-xs text-muted-foreground leading-relaxed">An unaspected SR Moon operates in isolation — your emotional life runs on its own track. Feelings are vivid but disconnected. Journaling and creative expression become essential outlets.</p>
        </div>
      )}

      {/* Moon Aspects within SR */}
      {(() => {
        const moonSRAspects = analysis.srInternalAspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
        if (moonSRAspects.length === 0) return null;
        return (
          <div className="border border-border rounded-sm p-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-2">
              <Moon size={14} /> Moon Aspects Within the Solar Return
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {moonSRAspects.map((asp, i) => {
                const otherPlanet = asp.planet1 === 'Moon' ? asp.planet2 : asp.planet1;
                const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
                const moonAspData = srMoonAspects[otherPlanet];
                const interp = moonAspData ? (isHard ? moonAspData.hard : moonAspData.soft) : null;
                return (
                  <div key={i} className={`border rounded-sm p-3 space-y-2 ${isHard ? 'border-destructive/20 bg-destructive/5' : 'border-green-500/20 bg-green-500/5'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">☽ {asp.type} {PLANET_SYMBOLS[otherPlanet]} {otherPlanet}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                    </div>
                    {interp && <p className="text-xs text-muted-foreground leading-relaxed">{interp}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Moon Aspects to Natal */}
      {(() => {
        const moonNatalAspects = analysis.srToNatalAspects.filter(a => a.planet1 === 'Moon');
        if (moonNatalAspects.length === 0) return null;
        return (
          <div className="border border-border rounded-sm p-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-2">
              <Moon size={14} /> SR Moon → Natal Planets
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {moonNatalAspects.map((asp, i) => {
                const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.type);
                const moonAspData = srMoonAspects[asp.planet2];
                const interp = moonAspData ? (isHard ? moonAspData.hard : moonAspData.soft) : null;
                return (
                  <div key={i} className={`border rounded-sm p-3 space-y-2 ${isHard ? 'border-destructive/20 bg-destructive/5' : 'border-green-500/20 bg-green-500/5'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">SR ☽ {asp.type} Natal {PLANET_SYMBOLS[asp.planet2]} {asp.planet2}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
                    </div>
                    {interp && <p className="text-xs text-muted-foreground leading-relaxed">{interp}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Metonic Cycle */}
      {analysis.moonMetonicAges.length > 0 && (
        <div className="border border-border/50 rounded-sm p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-medium text-primary">The 19-Year Metonic Echo</p>
          {(() => {
            const age = analysis.profectionYear?.age ?? 0;
            const past = analysis.moonMetonicAges.filter(a => a < age);
            const future = analysis.moonMetonicAges.filter(a => a > age);
            return (
              <>
                <p className="text-xs text-muted-foreground">Moon in {analysis.moonSign} at ages:</p>
                <p className="text-xs text-foreground">
                  {past.length > 0 && <><span className="text-muted-foreground">Past: </span><strong>{past.join(', ')}</strong> · </>}
                  <span className="text-primary font-bold">Now: {age}</span>
                  {future.length > 0 && <> · <span className="text-muted-foreground">Next: </span><strong>{future.join(', ')}</strong></>}
                </p>
                <p className="text-xs text-muted-foreground italic">Reflect on those past ages. The same emotional themes cycle back — but you meet them with everything you've learned since.</p>
              </>
            );
          })()}
        </div>
      )}

      {/* Lunar Weather */}
      <LunarWeatherCard weather={lunarWeather} />
    </div>
  );
};
