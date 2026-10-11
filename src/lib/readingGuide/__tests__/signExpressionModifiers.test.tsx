import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildReadingGuide } from '../readingGuideEngine';
import { renderToStaticMarkup } from 'react-dom/server';
import { PractitionerWalkthroughSections } from '@/components/PractitionerWalkthroughSections';

const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function chart(planets: Record<string,[string,number]>, rising='Virgo'): NatalChart {
  return {id:'contrast-fixture', name:'Reference',birthDate:'1993-11-07',birthTime:'11:30',birthLocation:'Reference',
    planets:Object.fromEntries(Object.entries(planets).map(([body,[sign,degree]])=>[body,{sign,degree,minutes:0,seconds:0}])),
    houseCusps:Object.fromEntries(signs.map((_,i)=>[`house${i+1}`,{sign:signs[(signs.indexOf(rising)+i)%12],degree:0,minutes:0}]))} as NatalChart;
}
const read=(c:NatalChart,stageOverride:'adult'|'teen'|'child'='adult')=>buildReadingGuide(c,{now:new Date('2026-10-11T12:00:00Z'),stageOverride}).practitioner;

describe('Full-chart sign-expression contrasts',()=>{
  it('explains Libra social perception alongside privacy and independent first reactions',()=>{
    const r=read(chart({Sun:['Libra',20],Moon:['Libra',10],Mercury:['Libra',5],Mars:['Scorpio',8],Uranus:['Scorpio',9],Pluto:['Libra',11]},'Scorpio'));
    const c=r.expressionContrasts.find(c=>c.sign==='Libra');
    expect(c?.synthesis).toMatch(/competing viewpoints|unequal treatment/);
    expect(c?.synthesis).toMatch(/private preparation/);
    expect(c?.outside).toMatch(/House 1/);expect(c?.inside).toMatch(/House 12/);
    expect(c?.synthesis).not.toMatch(/beauty|harmony|mind and intensity combine|drive and disruption combine/);
    const ids=new Set(r.evidence.map(e=>e.id));for(const id of c?.evidenceIds ?? [])expect(ids.has(id)).toBe(true);
  });
  it('does not use an outer-to-outer sextile to override a personal sign expression',()=>{
    const r=read({...chart({Sun:['Libra',20],Moon:['Libra',10],Pluto:['Libra',11],Neptune:['Sagittarius',11]},'Scorpio')});
    expect(r.expressionContrasts.find(c=>c.sign==='Libra')?.modifiers.filter(m=>m.kind==='aspect').some(m=>m.evidenceIds.some(id=>/Neptune:Pluto/.test(id)))).toBe(false);
  });
  it('explains private Leo identity without declaring an outgoing stereotype',()=>{
    const r=read(chart({Sun:['Leo',15]}));const c=r.expressionContrasts.find(c=>c.sign==='Leo');
    expect(c?.synthesis).toMatch(/private|behind the scenes/);
    expect(c?.modifiers.some(m=>m.kind==='house'&&m.evidenceIds.includes('placement:Sun'))).toBe(true);
    expect(c?.synthesis).not.toMatch(/flamboyant|always|must be/);
  });
  it('synthesizes repeated Libra with private houses and a visible tight first-house cluster',()=>{
    const r=read(chart({Sun:['Libra',20],Moon:['Libra',10],Mercury:['Libra',5],Mars:['Scorpio',8],Uranus:['Scorpio',9],Pluto:['Libra',11]},'Scorpio'));
    const c=r.expressionContrasts.find(c=>c.sign==='Libra');
    expect(c?.modifiers.some(m=>m.kind==='house'&&/private/.test(m.meaning))).toBe(true);
    expect(c?.modifiers.some(m=>m.kind==='concentration'&&/House 1/.test(m.meaning))).toBe(true);
    expect(c?.modifiers.some(m=>m.kind==='aspect'&&m.evidenceIds.some(id=>id.includes('Moon:Pluto')))).toBe(true);
    expect(c?.synthesis).not.toMatch(/Libra loves beauty|Libra loves partnership/);
  });
  it('does not infer mismatch from a sign alone, missing houses, or a remote outer planet',()=>{
    const r=read({...chart({Sun:['Leo',15],Uranus:['Taurus',23]}),houseCusps:undefined});
    expect(r.expressionContrasts).toEqual([]);
    expect(renderToStaticMarkup(<PractitionerWalkthroughSections reading={r}/>)).not.toContain('What changes the obvious expression');
  });
  it('uses tight contacts but does not let wide Saturn contacts trigger a contrast',()=>{
    const c={...chart({Sun:['Leo',15],Saturn:['Taurus',15]}),houseCusps:undefined};
    expect(read(c).expressionContrasts[0]?.modifiers.some(m=>m.kind==='aspect')).toBe(true);
    expect(read({...c,planets:{...c.planets,Saturn:{sign:'Taurus',degree:22.5,minutes:0,seconds:0}}}).expressionContrasts).toEqual([]);
  });
  it('resolves every conclusion to exact evidence and preserves age-invariant eligibility',()=>{
    const c=chart({Sun:['Scorpio',15],Moon:['Leo',25],Mars:['Scorpio',20],Saturn:['Aquarius',25],Pluto:['Scorpio',25]},'Capricorn');
    const adult=read(c);const teen=read(c,'teen');const ids=new Set(adult.evidence.map(e=>e.id));
    for(const contrast of adult.expressionContrasts){
      expect(contrast.modifiers.length).toBeGreaterThan(0);
      for(const modifier of contrast.modifiers)for(const id of modifier.evidenceIds)expect(ids.has(id),id).toBe(true);
      for(const id of contrast.evidenceIds)expect(ids.has(id),id).toBe(true);
    }
    expect(adult.expressionContrasts.some(c=>c.modifiers.some(m=>m.kind==='configuration'))).toBe(true);
    expect(teen.expressionContrasts.map(c=>[c.id,c.weight,c.evidenceIds])).toEqual(adult.expressionContrasts.map(c=>[c.id,c.weight,c.evidenceIds]));
    expect(JSON.parse(JSON.stringify(adult)).expressionContrasts).toEqual(adult.expressionContrasts);
  });
  it('counts heavy signs from majors, not supplemental bodies, and does not invent conjunctions from houses',()=>{
    const r=read(chart({Sun:['Leo',15],Chiron:['Libra',7],NorthNode:['Libra',12],Venus:['Libra',25]}));
    expect(r.expressionContrasts.some(c=>c.sign==='Libra')).toBe(false);
    expect(r.expressionContrasts.some(c=>c.modifiers.some(m=>/tightly joined/.test(m.meaning)))).toBe(false);
  });
});