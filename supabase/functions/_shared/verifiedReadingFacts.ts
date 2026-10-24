/** Fail-only fact gate. Never rewrites a reading or manufactures a fact. */
export const VERIFIED_FACTS_START = 'VERIFIED_READING_FACTS_START';
export const VERIFIED_FACTS_END = 'VERIFIED_READING_FACTS_END';
export interface VerifiedPlacement { id: string; layer: string; planet: string; sign: string; longitude: number; house: number | null; retrograde: boolean | null }
export interface VerifiedContact { id: string; layer: string; planet1: string; planet2: string; aspect: string; orb: number; exactDates: string[]; classification?: string; windows?: { classification: string; closestDate: string; closestOrb: number; exactDates: string[] }[] }
export interface VerifiedReadingFacts {
  version: number;
  chartId: string;
  solarReturnAvailable: boolean;
  placements: VerifiedPlacement[];
  contacts: VerifiedContact[];
  rulerChains: unknown[];
  relationship?: {
    natalPoints: VerifiedPlacement[];
    solarReturn: { available: boolean; placements: VerifiedPlacement[]; contacts: VerifiedContact[]; rulerChains: unknown[] } | null;
    qualifyingTransits: VerifiedContact[];
    requiredEvidenceIds: string[];
  };
}
export function extractVerifiedReadingFacts(context: string): VerifiedReadingFacts | null {
  const start = context.indexOf(VERIFIED_FACTS_START), end = context.indexOf(VERIFIED_FACTS_END);
  if (start < 0 || end <= start) return null;
  try { const facts = JSON.parse(context.slice(start + VERIFIED_FACTS_START.length, end)); return facts.version === 1 && Array.isArray(facts.placements) && Array.isArray(facts.contacts) ? facts : null; } catch { return null; }
}
const BODY = '(?:North ?Node|South ?Node|Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|Ascendant|Descendant|Midheaven|ASC|DSC|MC|IC)';
const SIGN = '(?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)';
const canonical = (s: string) => ({ asc: 'Ascendant', dsc: 'Descendant', mc: 'Midheaven', northnode: 'NorthNode', southnode: 'SouthNode' }[s.toLowerCase().replace(/\s/g,'')] ?? s[0].toUpperCase()+s.slice(1).toLowerCase());
const delta = (a: number, b: number) => Math.abs(((a-b+540)%360)-180);
const aspectName = (s: string) => ({ conjunct: 'conjunction', opposite: 'opposition', '☌':'conjunction', '☍':'opposition', '□':'square', '△':'trine', '⚹':'sextile' }[s.toLowerCase()] ?? s.toLowerCase());
/** Validate supported explicit claim grammar and evidence references, withhold on any mismatch. */
export function validateVerifiedReading(reading: unknown, facts: VerifiedReadingFacts): string[] {
  const errors: string[] = [];
  const ids = new Set([...facts.placements,...facts.contacts].map(p => p.id));
  const strings: string[] = [];
  const walk = (value: unknown, key = '') => {
    if (typeof value === 'string') {
      if (!key.startsWith('_')) strings.push(value);
    } else if (Array.isArray(value)) value.forEach(v => walk(v, key));
    else if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) { if (!k.startsWith('_')) walk(v,k); }
  };
  walk(reading);
  if ((reading as { question_type?: string } | null)?.question_type === 'relationship') {
    for (const id of facts.relationship?.requiredEvidenceIds ?? []) {
      if (!strings.some(s => s.includes(`[evidence:${id}]`))) errors.push(`Required relationship evidence omitted: ${id}`);
    }
  }
  for (const text of strings.flatMap(s => s.split(/(?<=[.!?])\s+|\n/))) {
    for (const match of text.matchAll(/\[evidence:([^\]]+)\]/g)) if (!ids.has(match[1])) errors.push('Unknown evidence reference');
    if (/\byou (?:keep choosing|always choose|have repeatedly chosen|have always attracted)\b/i.test(text)) errors.push('Unsupported behavioral history');
    if (!facts.solarReturnAvailable && /\b(?:SR|solar return)\b/i.test(text) && !/(?:unavailable|not available|missing|not provided|no solar return|cannot|needs? (?:a |the )?solar return)/i.test(text)) errors.push('Solar Return claims without Solar Return data');
    const layer = /\b(?:SR|solar return)\b/i.test(text) ? 'sr' : /\b(?:transiting|transit)\b/i.test(text) ? 'transit' : 'natal';
    const positions = facts.placements.filter(p => p.layer === layer);
    for (const m of text.matchAll(new RegExp(`(${BODY})\\s+(?:is\\s+)?(?:at\\s+|in\\s+)?(\\d{1,2})°(?:\\s*(\\d{1,2})[′'](?:\\s*(\\d{1,2})[″"])?\\s*)?\\s*(${SIGN})`, 'gi'))) {
      const planet = canonical(m[1]), index = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].findIndex(s=>s.toLowerCase()===m[5].toLowerCase());
      const longitude = index*30+Number(m[2])+Number(m[3]??0)/60+Number(m[4]??0)/3600;
      const tolerance = m[4] ? 1/3600 : m[3] ? 1/60 : 1;
      if (!positions.some(p=>p.planet===planet && delta(p.longitude,longitude)<=tolerance)) errors.push(`Unverified ${layer} ${planet} position`);
    }
    for (const m of text.matchAll(new RegExp(`(${BODY})\\s+(?:is\\s+)?in\\s+(${SIGN})`, 'gi'))) if (!positions.some(p=>p.planet===canonical(m[1]) && p.sign.toLowerCase()===m[2].toLowerCase())) errors.push('Unverified sign claim');
    for (const m of text.matchAll(new RegExp(`(${BODY})\\s+(?:is\\s+)?(?:in|occupies)\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+house`, 'gi'))) if (!positions.some(p=>p.planet===canonical(m[1]) && p.house===Number(m[2]))) errors.push('Unverified house claim');
    for (const m of text.matchAll(new RegExp(`(${BODY})\\s+(?:is\\s+)?retrograde`, 'gi'))) if (!positions.some(p=>p.planet===canonical(m[1]) && p.retrograde===true)) errors.push('Unverified retrograde claim');
    for (const m of text.matchAll(new RegExp(`(${BODY})\\s+(?:is\\s+)?(conjunct(?:ion)?|opposit(?:e|ion)|square|trine|sextile|quincunx|☌|☍|□|△|⚹)\\s+(?:natal\\s+)?(${BODY})(?:[^.!?\\n]{0,45}?orb[: ]+(\\d+(?:\\.\\d+)?)°)?`, 'gi'))) {
      const a=canonical(m[1]), b=canonical(m[3]), aspect=aspectName(m[2]);
      const pool = facts.contacts.filter(c=>c.layer===(layer==='transit'?'transit-to-natal':layer==='sr'?( /\bnatal\b/i.test(m[0]) ? 'sr-to-natal':'sr-internal'):'natal') && c.aspect===aspect && ((c.planet1===a && c.planet2===b) || (layer==='natal' && c.planet1===b && c.planet2===a)));
      if (!pool.length) { errors.push('Unverified aspect claim'); continue; }
      if (m[4] && !pool.some(c=>Math.abs(c.orb-Number(m[4]))<=0.02)) errors.push('Unverified orb claim');
      if (/\bexact\b/i.test(text) && layer==='transit') {
        const dates=[...text.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map(d=>d[1]);
        if (!pool.some(c=>c.exactDates.length && (dates.length===0 || dates.every(d=>c.exactDates.some(e=>e.slice(0,10)===d))))) errors.push('Unverified exact transit date');
      }
    }
  }
  return [...new Set(errors)];
}

/** Build the same gate contract from the validated Solar Return export. */
export function verifiedFactsFromSolarReturnReport(report: Record<string, any>): VerifiedReadingFacts {
  const placements: VerifiedPlacement[] = [];
  for (const [layer, pool] of [['natal',report.natalPlanetsRaw],['sr',report.srPlanetsRaw]] as const) {
    for (const [planet,p] of Object.entries(pool || {}) as [string,any][]) {
      const index=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(p.sign);
      if (index<0) continue;
      const longitude=Number.isFinite(p.longitude)?p.longitude:index*30+(p.degree||0)+(p.minutes||0)/60+(p.seconds||0)/3600;
      placements.push({id:`${layer}:${planet}`,layer,planet,sign:p.sign,longitude,house:layer==='sr'?(report.planetSRHouses?.[planet]??null):(report.houseOverlays?.find((x:any)=>x.planet===planet)?.natalHouse??null),retrograde:p.isRetrograde??null});
    }
  }
  const contacts: VerifiedContact[] = [];
  for (const [layer,pool] of [['sr-internal',report.srInternalAspects],['sr-to-natal',report.srToNatalAspects]] as const) for (const a of pool||[]) {
    const planet1=a.planet1||a.srPlanet,planet2=a.planet2||a.natalPlanet,aspect=aspectName(a.type||a.aspectType||a.aspect);
    contacts.push({id:`${layer}:${planet1}:${aspect}:${planet2}`,layer,planet1,planet2,aspect,orb:a.orb,exactDates:[]});
  }
  return {version:1,chartId:report.calculationMetadata?.natalChartId||'',solarReturnAvailable:true,placements,contacts,rulerChains:Array.isArray(report.rulerChains)?report.rulerChains:Object.values(report.rulerChains||{})};
}
