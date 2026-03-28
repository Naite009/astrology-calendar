import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { PLANET_SYMBOLS } from '@/lib/solarReturnConstants';
import { calculateLifeDomainScores } from '@/lib/solarReturnLifeDomainScores';
import { generateDomainDeepDives } from '@/lib/solarReturnDomainDeepDive';
import { detectContradictions } from '@/lib/solarReturnContradictions';
import { DomainDeepDiveCards } from '@/components/solarReturn/DomainDeepDiveCards';
import { ContradictionCard } from '@/components/solarReturn/ContradictionCard';

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

// Map synthesis section titles to domain score categories
const SYNTHESIS_TO_DOMAIN: Record<string, string[]> = {
  'Love & Relationships': ['love', 'relationships'],
  'Career & Purpose': ['career', 'purpose'],
  'Money & Resources': ['money', 'resources', 'finances'],
  'Inner Growth': ['growth', 'spiritual', 'inner'],
  'Health & Body': ['health', 'body', 'vitality'],
  'Home & Family': ['home', 'family'],
};

export const LifeAreasTab = ({ analysis, srChart, natalChart }: Props) => {
  const lifeDomainScores = useMemo(() => calculateLifeDomainScores(analysis), [analysis]);
  const domainDeepDives = useMemo(() => generateDomainDeepDives(analysis, natalChart, srChart), [analysis, natalChart, srChart]);
  const contradictions = useMemo(() => detectContradictions(analysis, srChart), [analysis, srChart]);

  return (
    <div className="space-y-6 mt-4">
      {/* Synthesis Sections (primary narrative) */}
      {analysis.synthesisSections.length > 0 && (
        <div className="space-y-4">
          {analysis.synthesisSections.map((section, i) => {
            // Find matching domain scores
            const allDomains = Object.values(lifeDomainScores) as LifeDomainScore[];
            const matchingDomains = allDomains.filter((d: LifeDomainScore) => {
              const keywords = SYNTHESIS_TO_DOMAIN[section.title] || [section.title.toLowerCase()];
              return keywords.some(k => d.domain.toLowerCase().includes(k));
            });

            return (
              <div key={i} className="border border-primary/20 rounded-sm bg-card overflow-hidden">
                {/* Section header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium ${
                      section.strength === 'strong' ? 'bg-primary/10 text-primary' :
                      section.strength === 'moderate' ? 'bg-secondary text-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>{section.strength}</span>
                    <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-xs text-primary font-medium mb-2">{section.theme}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.narrative}</p>
                </div>

                {/* Key planets & houses */}
                <div className="px-5 py-3 bg-secondary/20 border-b border-border flex flex-wrap gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Planets:</span>
                    {section.keyPlanets.map(p => (
                      <span key={p} className="text-xs text-foreground">{PLANET_SYMBOLS[p]} {p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Houses:</span>
                    {section.keyHouses.map(h => (
                      <span key={h} className="text-xs text-foreground">H{h}</span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="p-5 space-y-2">
                  {section.highlights.map((h, j) => (
                    <p key={j} className="text-xs text-muted-foreground leading-relaxed">• {h}</p>
                  ))}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{section.interpretation}</p>
                </div>

                {/* Supporting domain scores */}
                {matchingDomains.length > 0 && (
                  <div className="px-5 py-3 border-t border-border bg-muted/20">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Domain Scores</p>
                    <div className="flex flex-wrap gap-3">
                      {matchingDomains.map((d, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="text-xs text-foreground font-medium">{d.domain}</span>
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${d.score * 10}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{d.score}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Domain Deep Dives */}
      <DomainDeepDiveCards domains={domainDeepDives} />

      {/* Remaining domain scores not matched to synthesis */}
      {Object.keys(lifeDomainScores).length > 0 && (
        <div className="border border-border rounded-sm p-5 bg-card">
          <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-3">All Life Domain Scores</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.values(lifeDomainScores) as LifeDomainScore[]).map((d, i) => (
              <div key={i} className="text-center p-3 bg-secondary/20 rounded-sm">
                <p className="text-lg font-semibold text-foreground">{d.score}</p>
                <p className="text-[10px] text-muted-foreground">{d.domain}</p>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                  <div className={`h-full rounded-full ${d.score >= 7 ? 'bg-primary' : d.score >= 4 ? 'bg-primary/60' : 'bg-muted-foreground/40'}`} style={{ width: `${d.score * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradictions */}
      {contradictions.length > 0 && <ContradictionCard contradictions={contradictions} />}
    </div>
  );
};
