import { it } from 'vitest';
import { analyzeSolarReturn } from '../solarReturnAnalysis';
import { laurenNatal, laurenReturn } from '@/test/fixtures/solarReturnLauren';
import { getNatalAspectExpression } from '../interpretation/psychologicalFunctions';
import { validateSolarReturnProse } from '../../../supabase/functions/_shared/solarReturnProseQuality';
it('audit',()=>{const a=analyzeSolarReturn(laurenReturn,laurenNatal);for(const c of [...a.srToNatalAspects,...a.srInternalAspects])if(!c.interpretation){const t=getNatalAspectExpression({a:c.planet1,b:c.planet2,aspect:c.type.toLowerCase(),orb:c.orb} as any);console.log(JSON.stringify({c,t,errors:validateSolarReturnProse(t)}));}});
