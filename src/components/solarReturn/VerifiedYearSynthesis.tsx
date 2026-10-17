import { useMemo } from 'react';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import type { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { buildSolarReturnEvidenceSynthesis } from '@/lib/solarReturnEvidenceSynthesis';

export function VerifiedYearSynthesis({ analysis, srChart, natalChart }: { analysis: SolarReturnAnalysis; srChart: SolarReturnChart; natalChart: NatalChart }) {
  const result = useMemo(() => buildSolarReturnEvidenceSynthesis(analysis, srChart, natalChart), [analysis, srChart, natalChart]);
  const m = result.calculationMetadata;
  return <section className="space-y-5 border-b border-border pb-6">
    <h3 className="text-lg font-medium text-foreground">The strongest threads of your year</h3>
    <p className="text-xs text-muted-foreground">Natal ruler: {analysis.natalChartRuler?.planet || 'unknown'}. Solar Return ruler: {analysis.yearlyTheme?.ascendantRuler || 'unknown'}. Profection lord: {analysis.profectionLord || 'unknown'}.</p>
    {[...result.themes, ...(result.longerTerm ? [result.longerTerm] : [])].map(item => <div key={item.title} className="space-y-2">
      <p className="text-xs text-primary">{item.layer}</p>
      <h4 className="font-medium text-foreground">{item.title}</h4>
      <p className="text-sm leading-relaxed text-muted-foreground">{item.meaning}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">Evidence: {item.evidence.join(' ')}</p>
    </div>)}
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer text-foreground">Return time and source information</summary>
      <div className="mt-2 space-y-2">
        <p>Return instant: {m.returnInstantUTC || 'unavailable'} ({m.instantSource}).</p>
        <p>Recorded return location: {m.location || 'not recorded'}. Coordinates: {m.latitude ?? 'unknown'}, {m.longitude ?? 'unknown'}. Timezone: {m.timezone || 'unknown'}.</p>
        <p>Imported house system: {m.houseSystem || 'not recorded'}. Imported ephemeris: {m.storedEphemeris || 'not recorded'}. Derived timing: {m.derivedTimingEphemeris}.</p>
        {m.warnings.map(w => <p key={w}>{w}</p>)}
      </div>
    </details>
  </section>;
}