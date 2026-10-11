import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildReadingGuide } from '../readingGuideEngine';
import { collectCoreBodies } from '../readingGuideEngine';
import { renderToStaticMarkup } from 'react-dom/server';
import { PractitionerWalkthroughSections } from '@/components/PractitionerWalkthroughSections';
import { computeRankedAspects } from '@/lib/aspectRanking';

const NOW = new Date('2026-10-11T12:00:00Z');
const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function fixture(positions: Record<string, [string, number, boolean?]>, rising = 'Capricorn'): NatalChart {
  const start = signs.indexOf(rising);
  return { id: 'theme-fixture', name: 'Reference chart', birthDate: '1993-11-07',birthTime:'11:30',birthLocation:'Reference location',
    planets: Object.fromEntries(Object.entries(positions).map(([body,[sign,degree,isRetrograde]])=>[body,{sign,degree,minutes:0,seconds:0,isRetrograde:!!isRetrograde}])),
    houseCusps: Object.fromEntries(Array.from({length:12},(_,i)=>[`house${i+1}`,{sign:signs[(start+i)%12],degree:0,minutes:0}])) } as NatalChart;
}
const CHART = fixture({ Sun:['Scorpio',15], Moon:['Leo',25], Mercury:['Scorpio',11,true],Venus:['Libra',27],Mars:['Scorpio',20],Jupiter:['Libra',29],Saturn:['Aquarius',25],Uranus:['Capricorn',19],Neptune:['Capricorn',19],Pluto:['Scorpio',25] });
const reading = (chart=CHART,stageOverride?:'child'|'teen'|'adult') => buildReadingGuide(chart,{now:NOW,stageOverride}).practitioner;

describe('Practitioner Chart Walkthrough',()=>{
 it('exports a distinct theme-led structure with resolvable exact evidence',()=>{
  const r=reading(); const evidence=new Map(r.evidence.map(e=>[e.id,e]));
  expect(r.schemaVersion).toBe(2); expect(r.chartId).toBe(CHART.id);
  expect(r.opening.signatures.length).toBeGreaterThanOrEqual(3);expect(r.opening.signatures.length).toBeLessThanOrEqual(6);
  expect(r.themes.length).toBeGreaterThanOrEqual(3);
  for(const item of [...r.opening.signatures,...r.themes,...r.configurations,...r.hiddenPatterns,...r.closing.threads,...r.closing.questions]) {
   expect(item.evidenceIds.length).toBeGreaterThan(0);
   for(const id of item.evidenceIds)expect(evidence.has(id),id).toBe(true);
  }
  for(const theme of r.themes){expect(theme.reasoning.length).toBeGreaterThan(1);expect(theme.tension).toMatch(/part|need|want/i);expect(theme.tryThis.behaviors.length).toBeGreaterThan(0);}
  expect(r.evidence.find(e=>e.id==='placement:Mercury')?.text).toContain('℞');
  expect(JSON.parse(JSON.stringify(r))).toEqual(r);
 });
 it('names the traditional chart ruler, condition, MC ruler, and dispositors',()=>{
  const r=reading();expect(r.chartRuler?.title).toContain('Saturn');
  expect(r.chartRuler?.condition).toContain('domicile');
  expect(r.evidence.some(e=>e.id==='ruler:house10' && /Mars/.test(e.text))).toBe(true);
  expect(r.evidence.some(e=>e.kind==='rulership' && e.id.startsWith('dispositor:'))).toBe(true);
 });
 it('retains canonical wide aspect labels and down-weights them',()=>{
  const c=fixture({Sun:['Scorpio',15.2],Pluto:['Scorpio',25],Moon:['Leo',19],Mercury:['Scorpio',11.5],Saturn:['Aquarius',25]});
  const r=reading(c);for(const a of computeRankedAspects(c).filter(a=>a.isWide)){
   const e=r.evidence.find(e=>e.bodies.includes(a.a)&&e.bodies.includes(a.b)&&e.kind==='aspect'&&e.orb===a.orb);
   expect(e?.wide).toBe(true);expect(e?.text).toContain('lower weight');
  }
 });
 it('validates the T-square and derives the symbolic Taurus balancing point opposite Pluto',()=>{
  const r=reading();const t=r.configurations.find(c=>c.name==='T-Square'&&c.apex==='Pluto');
  expect(t?.release).toMatchObject({sign:'Taurus',degree:25,house:5,occupiedBy:[]});
  expect(t?.release?.note).toMatch(/not another planet/);expect(t?.integration).toMatch(/slower pace/);expect(t?.integration).toMatch(/play|creative/);
  expect(t?.evidenceIds.filter(id=>id.startsWith('aspect:'))).toHaveLength(3);
 });
 it('keeps a mathematically incomplete kite out of the reading',()=>{
  const c=fixture({Sun:['Aries',0],Moon:['Leo',7],Mars:['Sagittarius',0],Jupiter:['Libra',0]});
  expect(reading(c).configurations.some(c=>c.name==='Kite')).toBe(false);
 });
 it('recognizes valid grand trines, kites, crosses, rectangles, and yods',()=>{
  const cases:Array<[string,Record<string,[string,number]>]>= [
   ['Grand Trine',{Sun:['Aries',0],Moon:['Leo',0],Mars:['Sagittarius',0]}],
   ['Kite',{Sun:['Aries',0],Moon:['Leo',0],Mars:['Sagittarius',0],Jupiter:['Libra',0]}],
   ['Grand Cross',{Sun:['Aries',0],Moon:['Libra',0],Mars:['Cancer',0],Saturn:['Capricorn',0]}],
   ['Mystic Rectangle',{Sun:['Aries',0],Moon:['Libra',0],Mars:['Leo',0],Saturn:['Aquarius',0]}],
   ['Yod',{Sun:['Aries',0],Moon:['Gemini',0],Mars:['Scorpio',0]}],
  ];
  for(const [name,pos] of cases)expect(reading(fixture(pos)).configurations.some(c=>c.name===name),name).toBe(true);
 });
 it('withholds houses rather than inventing a full-chart story when cusp data is incomplete',()=>{
  const r=reading({...CHART,houseCusps:undefined});
  expect(r.themes.every(t=>!t.id.startsWith('theme:house'))).toBe(true);
  expect(r.evidence.filter(e=>e.kind==='rulership').every(e=>!e.id.startsWith('ruler:house'))).toBe(true);
  expect(r.limitations.join(' ')).toMatch(/withheld/);
 });
 it('changes life wording but never evidence or rankings with a developmental override',()=>{
  const adult=reading(CHART,'adult');const child=reading(CHART,'child');
  expect(child.evidence).toEqual(adult.evidence);
  expect(child.opening.signatures.map(s=>[s.id,s.weight])).toEqual(adult.opening.signatures.map(s=>[s.id,s.weight]));
  expect(child.themes.map(t=>[t.id,t.weight])).toEqual(adult.themes.map(t=>[t.id,t.weight]));
 });
 it('counts only ten majors and does not inflate configurations with the nodal opposition',()=>{
  const r=reading({...CHART,planets:{...CHART.planets,NorthNode:{sign:'Scorpio',degree:25,minutes:0,seconds:0},SouthNode:{sign:'Taurus',degree:25,minutes:0,seconds:0}}});
  expect(r.balance.synthesis).not.toMatch(/missing qualit|deficit/);
  expect(r.evidence.find(e=>e.id==='balance:ten-planets')?.bodies).toHaveLength(10);
  expect(r.evidence.some(e=>e.kind==='aspect'&&e.bodies.includes('NorthNode')&&e.bodies.includes('SouthNode'))).toBe(false);
 });
 it('keeps different charts distinct and renders practitioner sections instead of an encyclopedia',()=>{
  const r=reading();const other=reading(fixture({Sun:['Gemini',13],Moon:['Virgo',18],Mercury:['Gemini',15],Venus:['Taurus',2],Mars:['Aries',4],Saturn:['Sagittarius',7]},'Leo'));
  expect(r.themes.map(t=>t.title)).not.toEqual(other.themes.map(t=>t.title));
  const html=renderToStaticMarkup(<PractitionerWalkthroughSections reading={r}/>);
  expect(html).toContain('What stands out first');expect(html).toContain('Recognition check');expect(html).toContain('Astrological evidence');
  expect(html).not.toMatch(/Blended characteristics|Psychological map|Personal planets, grouped|runs the show|engine of the whole chart|covers,|linked in this chart|true to they/);
  expect(r.closing.questions.length).toBeGreaterThanOrEqual(3);
  expect(collectCoreBodies(CHART).find(p=>p.body==='Mercury')?.isRetrograde).toBe(true);
 });
});
