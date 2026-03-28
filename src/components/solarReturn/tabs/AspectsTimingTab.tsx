import { useMemo, useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS } from '@/lib/solarReturnConstants';
import { calculateActivationWindows } from '@/lib/solarReturnActivationWindows';
import { generateSRtoNatalInterpretation, aspectTypeMeanings, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { ActivationTimeline } from '@/components/solarReturn/ActivationTimeline';
import { AngleActivationCard } from '@/components/solarReturn/AngleActivationCard';
import { PlanetToAngleCard } from '@/components/solarReturn/PlanetToAngleCard';
import { Sparkles, Target } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

const aspectColor = (type: string): string => {
  switch (type) {
    case 'Conjunction': return 'text-primary';
    case 'Trine': case 'Sextile': return 'text-green-500';
    case 'Square': case 'Opposition': return 'text-red-400';
    default: return 'text-muted-foreground';
  }
};

const aspectBg = (type: string) => {
  if (['Square', 'Opposition', 'Quincunx'].includes(type)) return 'bg-red-950/20 border-red-900/30';
  if (['Trine', 'Sextile'].includes(type)) return 'bg-emerald-950/20 border-emerald-900/30';
  if (type === 'Conjunction') return 'bg-amber-950/20 border-amber-900/30';
  return 'bg-card border-border';
};

export const AspectsTimingTab = ({ analysis, srChart, natalChart }: Props) => {
  const activationData = useMemo(() => {
    const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const toAbs = (pos: any): number | null => {
      if (!pos?.sign) return null;
      const idx = SIGNS.indexOf(pos.sign);
      return idx < 0 ? null : idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
    };
    const srPositions: Record<string, number> = {};
    for (const p of ['Sun', 'Moon', 'Ascendant', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury']) {
      const pos = srChart.planets?.[p as keyof typeof srChart.planets];
      const deg = pos ? toAbs(pos) : null;
      if (deg !== null) srPositions[p] = deg;
    }
    const mc = srChart.houseCusps?.house10;
    if (mc) { const d = toAbs(mc); if (d !== null) srPositions['MC'] = d; }
    const bd = natalChart.birthDate || '';
    const parts = bd.split('-');
    return calculateActivationWindows(srPositions, srChart.solarReturnYear, parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0, parts.length >= 3 ? parseInt(parts[2], 10) : 1);
  }, [srChart, natalChart]);

  return (
    <div className="space-y-6 mt-4">
      {/* SR to Natal Aspects — fully expanded */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-3">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">SR Planets → Natal Chart</h3>
        <p className="text-xs text-muted-foreground mb-3">How this year's planets connect to your birth chart — the most important predictive technique.</p>
        {analysis.srToNatalAspects.filter(a => !(a.planet1 === 'Sun' && a.planet2 === 'Sun' && a.type === 'Conjunction')).map((asp, i) => {
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const aspInfo = aspectTypeMeanings[asp.type];
          return (
            <div key={i} className={`border rounded-md p-4 space-y-3 ${aspectBg(asp.type)}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{PLANET_SYMBOLS[asp.planet1]}</span>
                <span className="text-xs text-muted-foreground">SR {asp.planet1}</span>
                <span className={`text-sm font-semibold ${aspectColor(asp.type)}`}>{aspInfo?.glyph || ''} {asp.type}</span>
                <span className="text-base">{PLANET_SYMBOLS[asp.planet2]}</span>
                <span className="text-xs text-muted-foreground">Natal {asp.planet2}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{interp.howItFeels}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{interp.whatItMeans}</p>
              <div className="bg-primary/10 border border-primary/20 rounded-sm p-2">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-0.5">What To Do</p>
                <p className="text-xs leading-relaxed">{interp.whatToDo}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SR Internal Aspects */}
      <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-3">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">SR Internal Aspects</h3>
        <p className="text-xs text-muted-foreground mb-3">How the planets within this year's chart talk to each other.</p>
        {analysis.srInternalAspects.map((asp, i) => {
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const aspInfo = aspectTypeMeanings[asp.type];
          return (
            <div key={i} className={`border rounded-md p-4 space-y-2 ${aspectBg(asp.type)}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{PLANET_SYMBOLS[asp.planet1]}</span>
                <span className="text-xs text-muted-foreground">{asp.planet1}</span>
                <span className={`text-sm font-semibold ${aspectColor(asp.type)}`}>{aspInfo?.glyph || ''} {asp.type}</span>
                <span className="text-base">{PLANET_SYMBOLS[asp.planet2]}</span>
                <span className="text-xs text-muted-foreground">{asp.planet2}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">orb {asp.orb}°</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{interp.howItFeels}</p>
              <div className="bg-primary/10 border border-primary/20 rounded-sm p-2">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-0.5">What To Do</p>
                <p className="text-xs leading-relaxed">{interp.whatToDo}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activation Timeline */}
      {activationData.transitHits.length > 0 && <ActivationTimeline data={activationData} />}

      {/* Angle Activations */}
      <AngleActivationCard natalChart={natalChart} srChart={srChart} />
      <PlanetToAngleCard natalChart={natalChart} srChart={srChart} />

      {/* Natal Degree Conduits */}
      {analysis.natalDegreeConduits.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
            <Target size={14} className="text-primary" /> Natal Degree Connections
          </h4>
          <div className="space-y-2">
            {analysis.natalDegreeConduits.map((c, i) => (
              <div key={i} className="bg-secondary/40 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-foreground">SR {PLANET_SYMBOLS[c.srPlanet]} {c.srPlanet} → Natal {PLANET_SYMBOLS[c.natalPlanet]} {c.natalPlanet}</span>
                  <span className="text-[10px] text-muted-foreground">{SIGN_SYMBOLS[c.srSign]} {c.degree} (orb: {c.orb}°)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Antiscia Contacts */}
      {analysis.antisciaContacts.length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card space-y-3">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Antiscia Contacts</h3>
          <p className="text-xs text-muted-foreground">Hidden mirror-degree connections between planets.</p>
          {analysis.antisciaContacts.map((c, i) => (
            <div key={i} className="bg-secondary/20 rounded-sm p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{c.planet1Source} {PLANET_SYMBOLS[c.planet1]} {c.planet1}</span>
                <span className="text-muted-foreground">↔</span>
                <span className="font-medium text-foreground">{c.planet2Source} {PLANET_SYMBOLS[c.planet2]} {c.planet2}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{c.type} · orb {c.orb}°</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{c.interpretation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Solar Arcs */}
      {analysis.solarArcs.length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card space-y-3">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Solar Arc Directions</h3>
          {analysis.solarArcs.map((sa, i) => (
            <div key={i} className="bg-secondary/20 rounded-sm p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">SA {PLANET_SYMBOLS[sa.natalPlanet]} {sa.natalPlanet}</span>
                <span className="text-muted-foreground">{sa.aspectType}</span>
                <span className="font-medium text-foreground">SR {PLANET_SYMBOLS[sa.aspectToSRPlanet]} {sa.aspectToSRPlanet}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">orb {sa.orb}°</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{sa.interpretation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Repeated Natal Themes / Pattern Tracking */}
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

      {/* Eclipse Sensitivity */}
      {analysis.eclipseSensitivity.length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card space-y-3">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Eclipse Connections</h3>
          {analysis.eclipseSensitivity.map((e, i) => (
            <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-sm p-3">
              <p className="text-xs font-medium text-foreground">{e.eclipseType} at {e.eclipseDegree} · orb {e.orb}°</p>
              <p className="text-xs text-muted-foreground">{e.interpretation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
