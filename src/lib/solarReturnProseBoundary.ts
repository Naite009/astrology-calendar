import { solarReturnProseViolations, validateSolarReturnProse } from '../../supabase/functions/_shared/solarReturnProseQuality';

const narrativeFields = new Set(['natalSunDesc','natalMoonDesc','natalRisingDesc','srMoonDesc','srRisingDesc','srRisingContrast','whatHouseChangeBrings','upcomingShift','currentExperience','interpretation','narrative','description','summary','overview','experience','focus','caution','practical','paragraph','becomingNarrative','tensionNote','tension','synthesis','resolution','leanInto','avoid','bestUse','trigger','antidote','oneLineMantra','coreFocus','yearArchetypeDescription','advice','yearPattern','emotionalTheme','overallTone','fatedTheme','lesson','blendMeaning','signMeaning','combinedInsight','coreStory','content','body','meaning','yearTheme','primaryFocus','emotionalClimate','keyMessage','clientSummary','fullDescription','emotional','bodyFeeling','whatItMeans','howItFeels','whatToDo','howToUseThisYear','closingMessage','identityShift','relationshipTheme','careerMoneyTheme','coreTheme']);
const narrativeLists = new Set(['bodyParagraphs','practicalAdvice','highlights']);
/** Withhold rejected composed prose, never edit numbers, placements, dates, sources or evidence labels. */
export function guardSolarReturnProse<T>(value: T): T {
  const walk = (v: unknown, key = ''): unknown => {
    if (typeof v === 'string') {
      if (narrativeFields.has(key) || narrativeLists.has(key)) return validateSolarReturnProse(v).length ? '' : v;
      return v;
    }
    if (Array.isArray(v)) return v.map(x => walk(x, key));
    if (v && typeof v === 'object' && !(v instanceof Date)) return Object.fromEntries(Object.entries(v).map(([k,x]) => [k,walk(x,k)]));
    return v;
  };
  return walk(value) as T;
}
export function auditSolarReturnProse(value: unknown): { path: string; errors: string[] }[] {
  const findings: { path: string; errors: string[] }[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') { const errors = solarReturnProseViolations(v); if (errors.length) findings.push({path,errors}); }
    else if (Array.isArray(v)) v.forEach((x,i) => walk(x,`${path}[${i}]`));
    else if (v && typeof v === 'object' && !(v instanceof Date)) Object.entries(v).forEach(([k,x]) => walk(x,`${path}.${k}`));
  };
  walk(value,'report'); return findings;
}
/** Render-boundary check for already-composed PDF/UI prose: true when the text may be shown. */
export function solarReturnRenderAllowed(text: string | null | undefined): boolean {
  if (!text) return false;
  return !solarReturnProseViolations(text).some(e => e !== 'Prohibited dash');
}
