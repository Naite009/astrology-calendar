import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildReadingGuide } from '../readingGuideEngine';
import { PractitionerWalkthroughSections } from '@/components/PractitionerWalkthroughSections';

const signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const fixture=(positions:Record<string,[string,number]>,rising='Capricorn'):NatalChart=>({id:'development-fixture',name:'Reference',birthDate:'1993-11-07',birthTime:'11:30',birthLocation:'Reference',
  planets:Object.fromEntries(Object.entries(positions).map(([body,[sign,degree]])=>[body,{sign,degree,minutes:0,seconds:0}])),
  houseCusps:Object.fromEntries(signs.map((_,i)=>[`house${i+1}`,{sign:signs[(signs.indexOf(rising)+i)%12],degree:0,minutes:0}]))} as NatalChart);
const read=(c:NatalChart,stageOverride:'adult'|'teen'|'child'='adult')=>buildReadingGuide(c,{now:new Date('2026-10-11T12:00:00Z'),stageOverride}).practitioner;
const saturn=fixture({Sun:['Scorpio',15],Moon:['Leo',25],Mercury:['Scorpio',11],Venus:['Libra',27],Mars:['Scorpio',20],Jupiter:['Libra',29],Saturn:['Aquarius',25],Uranus:['Capricorn',19],Neptune:['Capricorn',19],Pluto:['Scorpio',25]});
const modifiedLibra=fixture({Sun:['Libra',20],Moon:['Libra',10],Mercury:['Libra',5],Mars:['Scorpio',8],Uranus:['Scorpio',9],Pluto:['Libra',11]},'Scorpio');

describe('Developmental practitioner synthesis',()=>{
  it('connects Libra perception, private Moon and visible autonomy without inventing biography',()=>{
    const r=read(modifiedLibra);const json=JSON.stringify(r.developmentalSections);
    expect(json).toMatch(/social perception|comparing what different people expect/);
    expect(json).toMatch(/listening for agreement|listening and refusing|listening as consent/);
    expect(json).toMatch(/One possible developmental expression/);
    expect(json).toMatch(/not recovered history/);
    const center=r.developmentalSections.find(s=>s.id==='contradiction')?.conclusions[0];
    expect(center?.evidenceIds).toContain('aspect:Mars:Uranus:conjunction');
    expect(center?.evidenceIds).toContain('placement:Moon');
    expect(center?.text.length).toBeGreaterThan(600);
  });
  it('explains Moon Saturn self-monitoring, private needs, the house bridge and configuration',()=>{
    const r=read(saturn);const text=JSON.stringify(r.developmentalSections);
    expect(text).toMatch(/Moon in Leo, House 8/);expect(text).toMatch(/Saturn in Aquarius, House 2/);
    expect(text).toMatch(/composed|composure/);expect(text).toMatch(/before allowing it to be visible/);
    expect(text).toMatch(/T-Square/);expect(text).toMatch(/not a claim about parents/);
    expect(r.closing.threads.some(t=>t.text.includes('Being composed does not mean needing little'))).toBe(true);
  });
  it('keeps every deep conclusion evidence-resolvable and matches rendered JSON',()=>{
    for(const chart of [saturn,modifiedLibra,fixture({Sun:['Leo',15],Moon:['Cancer',7],Mercury:['Leo',18]},'Virgo')]){
      const r=read(chart);const ids=new Set(r.evidence.map(e=>e.id));
      for(const s of r.developmentalSections)for(const c of s.conclusions){
        expect(c.text.length).toBeGreaterThan(150);expect(c.evidenceIds.length).toBeGreaterThan(1);
        for(const id of c.evidenceIds)expect(ids.has(id),id).toBe(true);
      }
      const html=renderToStaticMarkup(<PractitionerWalkthroughSections reading={r}/>);
      for(const s of r.developmentalSections)expect(html).toContain(s.title.replace(/'/g,'&#x27;'));
      expect(JSON.parse(JSON.stringify(r)).developmentalSections).toEqual(r.developmentalSections);
      expect(r.schemaVersion).toBe(4);
    }
  });
  it('does not assign demanding childhood stories to private houses or wide contacts alone',()=>{
    const privateLeo=read(fixture({Sun:['Leo',15],Moon:['Cancer',7]},'Virgo'));
    expect(privateLeo.developmentalSections.some(s=>s.id==='development')).toBe(false);
    const wide=read({...fixture({Sun:['Leo',15],Saturn:['Taurus',22.5]}),houseCusps:undefined});
    expect(wide.developmentalSections).toEqual([]);
    const missing=read({...fixture({Sun:['Leo',15],Uranus:['Taurus',23]}),houseCusps:undefined});
    expect(missing.developmentalSections).toEqual([]);
  });
  it('distinguishes flowing resources from compulsory defensive learning',()=>{
    const r=read(fixture({Moon:['Leo',25],Saturn:['Aries',25]}));
    expect(JSON.stringify(r.developmentalSections)).toMatch(/available strength rather than a required defense/);
    expect(JSON.stringify(r.developmentalSections)).toMatch(/functions cooperate/);
  });
  it('preserves chart geometry and age-invariant evidence and removes worksheet leakage',()=>{
    const before=JSON.stringify(saturn);const adult=read(saturn);const child=read(saturn,'child');
    expect(JSON.stringify(saturn)).toBe(before);expect(child.evidence).toEqual(adult.evidence);
    expect(child.developmentalSections.map(s=>[s.id,s.conclusions.map(c=>[c.id,c.evidenceIds])])).toEqual(adult.developmentalSections.map(s=>[s.id,s.conclusions.map(c=>[c.id,c.evidenceIds])]));
    for(const r of [adult,child,read(modifiedLibra)]){
      const output=JSON.stringify(r)+' '+renderToStaticMarkup(<PractitionerWalkthroughSections reading={r}/>);
      expect(output).not.toMatch(/try this|this week|low.stakes|conversation script|write two options|set a time limit|one part may want|you were neglected|your mother was|your father was|you experienced abuse|you experienced trauma|self-defining than/gi);
      expect(r.closing).not.toHaveProperty('actions');
    }
  });
  it('produces distinct supported central hypotheses instead of one fixed personality story',()=>{
    expect(read(saturn).developmentalSections.find(s=>s.id==='contradiction')?.conclusions[0]?.id).not.toEqual(read(modifiedLibra).developmentalSections.find(s=>s.id==='contradiction')?.conclusions[0]?.id);
  });
});