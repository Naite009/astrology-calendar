import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeBody, longitudeToSignPosition, type BodyKey } from './ephemerisEngine';
import { houseForLongitude, toAbsoluteLongitude } from './houseForLongitude';
import { getNatalAngleTargets } from './transitAspects';
import { angularSeparation, classifyAspect } from './aspects/classifyAspect';
import { getEffectiveOrb } from './aspectOrbs';
import { buildAllRulerChains, relationshipTargetPriority } from './rulerChains';
import { scanFutureTransits } from './futureTransitScanner';
import { VERIFIED_FACTS_START, VERIFIED_FACTS_END, validateVerifiedReading, type VerifiedReadingFacts, type VerifiedPlacement } from '../../supabase/functions/_shared/verifiedReadingFacts';
const ASPECTS = [{name:'conjunction',angle:0},{name:'sextile',angle:60},{name:'square',angle:90},{name:'trine',angle:120},{name:'quincunx',angle:150},{name:'opposition',angle:180}];
const BODY_KEYS: BodyKey[] = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','Chiron'];
function chartPlacements(chart: NatalChart, layer: string): VerifiedPlacement[] {
  const angles = getNatalAngleTargets(chart);
  const rows = Object.entries(chart.planets).filter(([name])=>!['Ascendant','ASC','Midheaven','MC','Descendant','DSC','IC'].includes(name));
  const out: VerifiedPlacement[] = [];
  for (const [planet,p] of rows) {
    const longitude = toAbsoluteLongitude(p);
    if (!p || longitude === null) continue;
    out.push({ id:`${layer}:${planet}`, layer, planet, sign:p.sign, longitude, house:houseForLongitude(chart,longitude), retrograde:p.isRetrograde??null });
  }
  // A planets-only return has no angles, even if an old raw angle row remains.
  for (const a of angles) if (layer !== 'sr' || chart.houseCusps) out.push({ id:`${layer}:${a.name}`, layer, planet:a.name, sign:a.sign, longitude:a.longitude, house:houseForLongitude(chart,a.longitude), retrograde:false });
  return out;
}
export function buildVerifiedReadingFacts(chart: NatalChart, sr: SolarReturnChart | null, now = new Date(), months = 18): VerifiedReadingFacts {
  const natal = chartPlacements(chart,'natal');
  const returned = sr ? chartPlacements(sr,'sr') : [];
  const transiting: VerifiedPlacement[] = BODY_KEYS.flatMap(key=>{
    const b=computeBody(key,now);
    return b.ok ? [{id:`transit:${key}`,layer:'transit',planet:key,sign:longitudeToSignPosition(b.longitude).sign,longitude:b.longitude,house:houseForLongitude(chart,b.longitude),retrograde:key==='NorthNode'?null:b.retrograde}] : [];
  });
  const contacts: VerifiedReadingFacts['contacts'] = [];
  const pairs = (first: VerifiedPlacement[], second: VerifiedPlacement[], layer: string, internal: boolean) => {
    first.forEach((a,i)=>second.forEach((b,j)=>{
      if (internal && j<=i) return;
      const hit=classifyAspect(angularSeparation(a.longitude,b.longitude),ASPECTS,n=>layer==='transit-to-natal'?(n==='quincunx'?1:3):getEffectiveOrb(a.planet,b.planet,n));
      if (hit) contacts.push({id:`${layer}:${a.planet}:${hit.name}:${b.planet}`,layer,planet1:a.planet,planet2:b.planet,aspect:hit.name,orb:hit.orb,exactDates:[]});
    }));
  };
  pairs(natal,natal,'natal',true); pairs(returned,returned,'sr-internal',true); pairs(returned,natal,'sr-to-natal',false); pairs(transiting,natal,'transit-to-natal',false);
  if (months>0) {
    const windows=scanFutureTransits(natal.map(p=>({name:p.planet,longitude:p.longitude})),months);
    for (const w of windows) {
      const id=`transit-to-natal:${w.transitPlanet}:${w.aspect}:${w.natalPlanet}`;
      const old=contacts.find(c=>c.id===id);
      if (old) { old.exactDates.push(...w.exactDates.map(d=>d.date)); old.classification=w.classification; }
      else contacts.push({id,layer:'transit-to-natal',planet1:w.transitPlanet,planet2:w.natalPlanet,aspect:w.aspect,orb:w.closestOrb,exactDates:w.exactDates.map(d=>d.date),classification:w.classification});
    }
  }
  contacts.sort((a,b)=>relationshipTargetPriority(chart,a.planet2)-relationshipTargetPriority(chart,b.planet2)||a.orb-b.orb);
  return {version:1,chartId:chart.id,solarReturnAvailable:!!sr,placements:[...natal,...returned,...transiting],contacts,rulerChains:buildAllRulerChains(chart)};
}
export function verifiedReadingContext(facts: VerifiedReadingFacts): string {
  return `\nEPHEMERIS FACT CHECK: STRUCTURED CALCULATION CONTRACT\nThese facts override any older text/timing estimates. Interpret only supplied facts. Never calculate/discover placements, aspects, ruler chains or dates yourself. Contacts are relationship-relevance ordered. An empty exactDates list means no supplied exact hit; close-approach is NOT exact. Never substitute natal prose for a missing Solar Return section. Do not invent personal history. Use conditional behavioral possibilities. For every named contact, include [evidence:<id>]. Numeric facts must use these values, retaining natal/SR/transit layer. A missing SR must produce only a brief unavailable notice for the SR section.\n${VERIFIED_FACTS_START}\n${JSON.stringify(facts)}\n${VERIFIED_FACTS_END}\n`;
}
export function assertVerifiedReading(reading: unknown, facts: VerifiedReadingFacts): void {
  const errors=validateVerifiedReading(reading,facts);
  if (errors.length) throw new Error(`Reading withheld by the calculation check: ${errors.join('; ')}. Please regenerate.`);
}
