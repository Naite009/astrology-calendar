import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS, ordinal } from '@/lib/solarReturnConstants';
import { generateActionGuidance } from '@/lib/solarReturnActionGuidance';
import { srSunInHouse, srOverlayNarrative, angularPlanetMeaning } from '@/lib/solarReturnInterpretations';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep, type SRPlanetHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { vertexInSign, vertexInHouse, vertexAspectMeanings } from '@/lib/solarReturnVertex';
import { ActionGuidanceCard } from '@/components/solarReturn/ActionGuidanceCard';
import { NatalOverlayCard } from '@/components/solarReturn/NatalOverlayCard';
import { LandsVsPlaysOutCard } from '@/components/solarReturn/LandsVsPlaysOutCard';
import { SROverviewDashboard } from '@/components/solarReturn/SROverviewDashboard';
import { ArrowRight, Sparkles, MapPin, Zap, RotateCcw, Target } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

const ALL_DISPLAY_PLANETS = ['Sun','Moon','Ascendant','NorthNode','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Juno','Ceres','Pallas','Vesta'] as const;

export const PlanetsHousesTab = ({ analysis, srChart, natalChart }: Props) => {
  const actionGuidance = useMemo(() => {
    const srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }> = {};
    for (const [key, val] of Object.entries(srChart.planets || {})) {
      if (val) srPlanets[key] = { sign: (val as any).sign, isRetrograde: (val as any).isRetrograde };
    }
    return generateActionGuidance(analysis.planetSRHouses, srPlanets);
  }, [analysis, srChart]);

  const deepData: Record<string, Record<number, SRPlanetHouseDeep>> = {
    Mercury: srMercuryInHouseDeep, Venus: srVenusInHouseDeep, Mars: srMarsInHouseDeep,
    Jupiter: srJupiterInHouseDeep, Saturn: srSaturnInHouseDeep, Uranus: srUranusInHouseDeep,
    Neptune: srNeptuneInHouseDeep, Pluto: srPlutoInHouseDeep,
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Angular Planets */}
      {analysis.angularPlanets.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">⚡ Angular Planets — Year's Powerhouses</h4>
          <div className="space-y-2">
            {analysis.angularPlanets.map(p => (
              <div key={p} className="bg-primary/5 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{PLANET_SYMBOLS[p]}</span>
                  <span className="text-sm font-medium text-foreground">{p}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{angularPlanetMeaning[p] || `${p} on an angle amplifies its themes.`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planet Spotlight Cards — All planets with deep interpretations */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-primary" /> Planet Placements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_DISPLAY_PLANETS.map(planet => {
            const srPos = srChart.planets[planet as keyof typeof srChart.planets];
            if (!srPos?.sign) return null;
            const h = analysis.planetSRHouses[planet];
            const deepInfo = h && deepData[planet] ? deepData[planet][h] : null;
            const overlay = analysis.houseOverlays.find(o => o.planet === planet);

            return (
              <div key={planet} className="border border-primary/15 rounded-lg bg-card overflow-hidden">
                <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">{PLANET_SYMBOLS[planet]}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{planet}</h4>
                    <p className="text-xs text-muted-foreground">
                      {SIGN_SYMBOLS[srPos.sign]} {srPos.sign} {srPos.degree}°{srPos.minutes || 0}'
                      {h && ` · SR H${h}`}
                      {(srPos as any).isRetrograde && <span className="text-destructive ml-1">Rx</span>}
                    </p>
                    {overlay?.natalHouse && overlay.natalHouse !== h && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ArrowRight size={10} /> Natal H{overlay.natalHouse}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {deepInfo ? (
                    <>
                      <p className="text-xs font-semibold text-primary">{deepInfo.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{deepInfo.overview}</p>
                      <div className="bg-secondary/40 rounded-sm p-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Practical</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{deepInfo.practical}</p>
                      </div>
                      <div className="bg-destructive/5 rounded-sm p-2">
                        <p className="text-[10px] uppercase tracking-widest text-destructive mb-0.5">Caution</p>
                        <p className="text-[11px] text-foreground leading-relaxed">{deepInfo.caution}</p>
                      </div>
                    </>
                  ) : h && planet === 'Sun' && srSunInHouse[h] ? (
                    <>
                      <p className="text-xs font-semibold text-primary">{srSunInHouse[h].title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{srSunInHouse[h].overview}</p>
                    </>
                  ) : (
                    h && <p className="text-xs text-muted-foreground">{planet} in SR House {h} — {analysis.houseOverlays.find(o => o.planet === planet)?.srHouseTheme || ''}</p>
                  )}
                  {overlay?.natalHouse && h && overlay.natalHouse !== h && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-2 mt-2">
                      {srOverlayNarrative(planet, h, overlay.natalHouse)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
              <span key={p} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-sm">{PLANET_SYMBOLS[p]} {p} Rx</span>
            ))}
          </div>
        ) : <p className="text-sm text-foreground mb-2">No retrograde planets ✓</p>}
        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.retrogrades.interpretation}</p>
      </div>

      {/* Saturn & Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.saturnFocus && (
          <div className="border border-border rounded-sm p-4 bg-card">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">♄ Saturn's Assignment</h4>
            <p className="text-sm text-foreground mb-1">{SIGN_SYMBOLS[analysis.saturnFocus.sign]} {analysis.saturnFocus.sign}{analysis.saturnFocus.house ? ` · SR H${analysis.saturnFocus.house}` : ''}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.saturnFocus.interpretation}</p>
          </div>
        )}
        {analysis.nodesFocus && (
          <div className="border border-border rounded-sm p-4 bg-card">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Target size={14} className="text-primary" /> Growth Edge (North Node)
            </h4>
            <p className="text-sm text-foreground mb-1">{SIGN_SYMBOLS[analysis.nodesFocus.sign]} {analysis.nodesFocus.sign}{analysis.nodesFocus.house ? ` · SR H${analysis.nodesFocus.house}` : ''}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.nodesFocus.interpretation}</p>
          </div>
        )}
      </div>

      {/* Vertex */}
      {analysis.vertex && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
            <Zap size={16} className="text-primary" /> Vertex — Fated Encounters
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl font-serif text-primary">Vx {SIGN_SYMBOLS[analysis.vertex.sign]} {analysis.vertex.sign} {analysis.vertex.degree}°{String(analysis.vertex.minutes).padStart(2, '0')}'</span>
            {analysis.vertex.house && <span className="text-xs bg-muted px-2 py-1 rounded-sm text-muted-foreground">SR H{analysis.vertex.house}</span>}
          </div>
          {vertexInSign[analysis.vertex.sign] && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground">{vertexInSign[analysis.vertex.sign].title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{vertexInSign[analysis.vertex.sign].fatedTheme}</p>
              <p className="text-xs text-foreground leading-relaxed">{vertexInSign[analysis.vertex.sign].lesson}</p>
            </div>
          )}
          {analysis.vertex.house && vertexInHouse[analysis.vertex.house] && (
            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-semibold text-foreground">{vertexInHouse[analysis.vertex.house].title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{vertexInHouse[analysis.vertex.house].description}</p>
            </div>
          )}
          {analysis.vertex.aspects.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Vertex Aspects</h4>
              {analysis.vertex.aspects.slice(0, 8).map((asp, i) => (
                <div key={i} className="border border-border rounded-sm p-2 bg-muted/20 text-xs">
                  <span>{asp.planet} {asp.aspectType} (orb {asp.orb}°)</span>
                  {vertexAspectMeanings[asp.planet.replace('Natal ', '')] && (
                    <p className="text-muted-foreground mt-0.5">{vertexAspectMeanings[asp.planet.replace('Natal ', '')]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SR Ascendant in Natal House */}
      {analysis.srAscInNatalHouse && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> SR Ascendant in Natal Chart
          </h4>
          <p className="text-sm font-medium text-foreground mb-1">Falls in natal {ordinal(analysis.srAscInNatalHouse.natalHouse)} house</p>
          <p className="text-xs text-primary mb-2">{analysis.srAscInNatalHouse.natalHouseTheme}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.srAscInNatalHouse.interpretation}</p>
        </div>
      )}

      {/* Natal Overlay & Lands vs Plays Out */}
      <NatalOverlayCard analysis={analysis} />
      <LandsVsPlaysOutCard analysis={analysis} />

      {/* Action Guidance */}
      <ActionGuidanceCard guidance={actionGuidance} />

      {/* Dashboard Details */}
      <SROverviewDashboard analysis={analysis} natalChart={natalChart} srChart={srChart} />
    </div>
  );
};
