import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS, SIGN_SYMBOLS } from '@/lib/solarReturnConstants';
import { generateIdentityShift } from '@/lib/solarReturnIdentityShift';
import { generatePowerPortrait } from '@/lib/solarReturnPowerPortrait';
import { IdentityShiftCard } from '@/components/solarReturn/IdentityShiftCard';
import { PowerPortraitCard } from '@/components/solarReturn/PowerPortraitCard';
import { PsychologicalProfileCard } from '@/components/solarReturn/PsychologicalProfileCard';
import { DominantPlanetsCard } from '@/components/DominantPlanetsCard';
import { Flame, Repeat, Layers, Compass } from 'lucide-react';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const ProfileTab = ({ analysis, srChart, natalChart }: Props) => {
  const identityShift = useMemo(() => generateIdentityShift(analysis, srChart, natalChart), [analysis, srChart, natalChart]);
  const powerPortrait = useMemo(() => generatePowerPortrait(analysis, natalChart, srChart), [analysis, natalChart, srChart]);

  return (
    <div className="space-y-6 mt-4">
      {/* Psychological Profile */}
      <PsychologicalProfileCard natalChart={natalChart} srChart={srChart} />

      {/* Identity Shift */}
      <IdentityShiftCard shift={identityShift} />

      {/* Power Portrait */}
      <PowerPortraitCard portrait={powerPortrait} />

      {/* Dominant Planets */}
      {analysis.dominantPlanets && (
        <DominantPlanetsCard report={analysis.dominantPlanets} context="solar-return" />
      )}

      {/* Stelliums */}
      {analysis.stelliums.length > 0 && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-4">
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
              <Layers size={14} className="text-primary" /> Stelliums — Concentrated Energy
            </h4>
            <p className="text-xs text-muted-foreground">3+ true planets in the same sign or house.</p>
          </div>
          {analysis.stelliums.map((s, i) => (
            <div key={i} className="border border-border rounded-sm p-4 bg-card space-y-3">
              <p className="text-base font-serif text-foreground">{s.planets.length}-Planet Stellium in {s.location}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {s.planets.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-sm font-medium">{PLANET_SYMBOLS[p]} {p}</span>
                ))}
                {s.extras.length > 0 && s.extras.map(e => (
                  <span key={e} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-sm">{PLANET_SYMBOLS[e]} {e}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.interpretation}</p>
              {s.signMeaning && (
                <div className="bg-secondary/40 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What {s.location} Dominance Means</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.signMeaning}</p>
                </div>
              )}
              {s.blendMeaning && (
                <div className="bg-primary/5 rounded-sm p-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">This Combination</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.blendMeaning}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Element Balance */}
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
                    {planets.map(p => <span key={p} className="text-[10px] text-muted-foreground" title={p}>{PLANET_SYMBOLS[p]}</span>)}
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
                    {planets.map(p => <span key={p} className="text-[10px] text-muted-foreground" title={p}>{PLANET_SYMBOLS[p]}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{analysis.modalityBalance.interpretation}</p>
        </div>
      </div>

      {/* Hemispheric Emphasis */}
      {analysis.hemisphericEmphasis && (
        <div className="border border-primary/20 rounded-sm p-5 bg-card space-y-5">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Compass size={14} className="text-primary" /> Hemispheric Emphasis
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Upper', value: analysis.hemisphericEmphasis.upper, planets: analysis.hemisphericEmphasis.upperPlanets },
              { label: 'Lower', value: analysis.hemisphericEmphasis.lower, planets: analysis.hemisphericEmphasis.lowerPlanets },
              { label: 'East', value: analysis.hemisphericEmphasis.east, planets: analysis.hemisphericEmphasis.eastPlanets },
              { label: 'West', value: analysis.hemisphericEmphasis.west, planets: analysis.hemisphericEmphasis.westPlanets },
            ].map(item => (
              <div key={item.label} className="border border-border rounded-sm p-2 bg-muted/30">
                <div className="text-lg font-semibold text-foreground">{item.value}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{item.label}</div>
                {item.planets?.length > 0 && <div className="text-[8px] text-primary mt-1">{item.planets.join(', ')}</div>}
              </div>
            ))}
          </div>

          <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-medium text-primary">{analysis.hemisphericEmphasis.verticalLabel}</p>
            <h5 className="text-sm font-semibold text-foreground">{analysis.hemisphericEmphasis.verticalDetail.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.hemisphericEmphasis.verticalDetail.summary}</p>
            {analysis.hemisphericEmphasis.verticalDetail.bodyParagraphs.map((p, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </div>

          <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-medium text-primary">{analysis.hemisphericEmphasis.horizontalLabel}</p>
            <h5 className="text-sm font-semibold text-foreground">{analysis.hemisphericEmphasis.horizontalDetail.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{analysis.hemisphericEmphasis.horizontalDetail.summary}</p>
            {analysis.hemisphericEmphasis.horizontalDetail.bodyParagraphs.map((p, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </div>

          <div className="border border-primary/30 rounded-sm p-4 bg-primary/5">
            <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Combined Axis Synthesis</p>
            <p className="text-xs text-foreground leading-relaxed">{analysis.hemisphericEmphasis.combinedInsight}</p>
          </div>
        </div>
      )}
    </div>
  );
};
