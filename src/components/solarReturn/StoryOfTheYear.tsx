import type { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { VerifiedYearSynthesis } from './VerifiedYearSynthesis';
/** The former independent keyword/phase story is now the same evidence-led reading used in exports. */
export function StoryOfTheYear(props: {analysis:SolarReturnAnalysis;natalChart:NatalChart;srChart:SolarReturnChart}) { return <VerifiedYearSynthesis {...props} />; }
