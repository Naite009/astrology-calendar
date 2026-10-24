import { describe, it, expect, vi } from 'vitest';
import { calculateSolarReturnFromLongitude, calculateSolarReturnForChart, SR_SOLVER_TOLERANCE_DEG } from '../solarReturnAutoCalculator';
import { computeBody, longitudeToSignPosition, signPositionToLongitude, circularSeparation } from '../ephemerisEngine';
import { toStoredPosition } from '../natalChartCalculation';
import { buildRulerChain, relationshipTargetPriority } from '../rulerChains';
import { buildVerifiedReadingFacts } from '../verifiedReadingContext';
import { validateVerifiedReading } from '../../../supabase/functions/_shared/verifiedReadingFacts';
import { scanFutureTransits } from '../futureTransitScanner';
import { buildDeterministicTimingData } from '../deterministicTiming';
import { findExactHits } from '../transits/majorTransits';
import type { NatalChart } from '@/hooks/useNatalChart';

const target = 210+16+31/60+42/3600;
// Coordinates are test assumptions for the named town, not certified Astro.com metadata.
const coords = { latitude:41.122, longitude:-75.364 };
const referenceUTC = Date.parse('2026-11-08T22:24:06Z');
const result = calculateSolarReturnFromLongitude(target,'1985-11-08',2026,coords);
const natal = {
  id:'gina-qa',name:'Gina Maltese QA',birthDate:'1985-11-08',birthTime:'19:01',birthLocation:'Queens, NY',timezoneId:'America/New_York',
  planets:{Sun:longitudeToSignPosition(target), Moon:longitudeToSignPosition(150+26+29/60), Mercury:{...longitudeToSignPosition(249.506),isRetrograde:false}, Venus:longitudeToSignPosition(209.212), Mars:longitudeToSignPosition(187.7443642), Jupiter:longitudeToSignPosition(309.25957), Saturn:longitudeToSignPosition(239.04555)},
  houseCusps:{house1:longitudeToSignPosition(60+26+39/60),house7:longitudeToSignPosition(240+26+39/60),house5:longitudeToSignPosition(180),house10:longitudeToSignPosition(330)}
} as unknown as NatalChart;

describe('Gina Astro.com Solar Return independent numerical reference',()=>{
  it('reproduces 22:24:06 UT within 30 seconds using the supplied exact target',()=>{
    expect(Math.abs(Date.parse(result.srDateTimeUTC)-referenceUTC)).toBeLessThan(30000);
    expect(result.residualDegrees).toBeLessThan(SR_SOLVER_TOLERANCE_DEG);
    expect(circularSeparation(result.planets.Sun.longitude,target)).toBeLessThan(0.000001);
  });
  const expected: [string,number][] = [['Moon',210+12+24/60+59/3600],['Mercury',210+7+11/60],['Venus',180+23+23/60+27/3600],['Mars',120+22+30/60+33/3600],['Jupiter',120+25+12/60+42/3600],['Saturn',8+49/60+27/3600],['Uranus',60+4+22/60+30/3600],['Neptune',1+55/60+47/3600],['Pluto',300+3+12/60+11/3600],['NorthNode',300+26+17/60],['Chiron',27+43/60]];
  it.each(expected)('%s matches the supplied reference within 0.02 degrees', (body,lon)=>expect(circularSeparation(result.planets[body].longitude,lon)).toBeLessThan(0.02));
  it.each(['Mercury','Venus','Saturn','Uranus','Neptune','Chiron'])('%s is retrograde at the solved return',body=>expect(result.planets[body].isRetrograde).toBe(true));
  it.each(['Sun','Moon','Mars','Jupiter','Pluto'])('%s is not retrograde',body=>expect(result.planets[body].isRetrograde).toBe(false));
  it('preserves the Node convention without inventing a row flag',()=>expect(result.planets.NorthNode.isRetrograde).toBeUndefined());
  it('ASC, MC and DSC match within 0.1 degrees with town-level coordinates',()=>{
    expect(result.houseSystem).toBe('placidus');
    expect(circularSeparation(result.houseCusps.house1.longitude,30+29+33/60)).toBeLessThan(0.1);
    expect(circularSeparation(result.houseCusps.house10.longitude,300+6+23/60)).toBeLessThan(0.1);
    expect(circularSeparation(result.houseCusps.house7.longitude,210+29+33/60)).toBeLessThan(0.1);
  });
  it('birth-time engine Sun agrees with the supplied target within one arcsecond',()=>{
    const b=computeBody('Sun',new Date('1985-11-09T00:01:00Z'));
    expect(b.ok && circularSeparation(b.longitude,target)).toBeLessThan(1/3600);
  });
  it('unknown return location allows planets but never houses or angles',()=>{
    const r=calculateSolarReturnForChart(natal,2026);
    expect(r.houseCusps).toEqual({}); expect(r.houseSystem).toBeNull(); expect(r.housesAvailable).toBe(false);
    expect(r.planets.Ascendant).toBeUndefined(); expect(r.planets.Sun.longitude).toBeCloseTo(target,6);
  });
  it('recomputes a legacy minute-only natal Sun from the historical birth instant',()=>{
    const legacy={...natal,latitude:40.7282,longitude:-73.7949,placeConfidence:'high' as const,planets:{...natal.planets,Sun:{sign:'Scorpio',degree:16,minutes:31,seconds:0}}};
    const r=calculateSolarReturnForChart(legacy,2026,coords);
    expect(Math.abs(Date.parse(r.srDateTimeUTC)-referenceUTC)).toBeLessThan(30000);
    expect(r.targetLongitude).not.toBe(210+16+31/60);
  });
  it('stored longitude wins over rounded display fields',()=>{
    expect(signPositionToLongitude({sign:'Scorpio',degree:16,minutes:31,seconds:0,longitude:target})).toBeCloseTo(target,10);
    const p=toStoredPosition({...longitudeToSignPosition(target+0.0000003),source:'astronomy-engine'});
    expect(p.longitude).toBeCloseTo(target+0.0000003,10);
  });
});

describe('Gina relationship calculation failures',()=>{
  it('retains Moon square Descendant at ten arcminutes',()=>{
    const facts=buildVerifiedReadingFacts(natal,null,new Date('2026-10-24T12:00Z'),0);
    const aspect=facts.contacts.find(c=>c.layer==='natal' && c.planet1==='Moon' && c.planet2==='Descendant' && c.aspect==='square');
    expect(aspect?.orb).toBeCloseTo(10/60,8);
  });
  it('traces Jupiter Aquarius -> Saturn Scorpio -> Mars Libra -> Venus Libra self-dispositor',()=>{
    const chain=buildRulerChain(natal,7);
    expect(chain.cuspSign).toBe('Sagittarius'); expect(chain.traditionalRuler).toBe('Jupiter');
    expect(chain.steps.map(s=>s.planet)).toEqual(['Jupiter','Saturn','Mars','Venus']); expect(chain.termination).toBe('self-dispositor');
    expect(chain.steps[0].retrograde).toBeNull();
  });
  it('stops a ruler loop without making up a final ruler',()=>{
    const c={...natal,planets:{...natal.planets,Venus:longitudeToSignPosition(30),Mars:longitudeToSignPosition(180)},houseCusps:{house7:longitudeToSignPosition(210)}} as NatalChart;
    // Mars in Libra -> Venus in Taurus terminates; change Venus to Aries to make a loop.
    c.planets.Venus=longitudeToSignPosition(0);
    expect(buildRulerChain(c,7).termination).toBe('loop');
  });
  it('ranks relationship targets ahead of generic Sun/MC targets',()=>{
    expect(relationshipTargetPriority(natal,'Descendant')).toBeLessThan(relationshipTargetPriority(natal,'Sun'));
    expect(relationshipTargetPriority(natal,'Jupiter')).toBeLessThan(relationshipTargetPriority(natal,'Midheaven'));
  });
  it('Saturn approaches natal Mars opposition in December 2026 without an exact hit',()=>{
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-24T00:00Z'));
    try {
      const windows=scanFutureTransits([{name:'Mars',longitude:187.7443642}],3);
      const w=windows.find(w=>w.transitPlanet==='Saturn' && w.aspect==='opposition');
      expect(w).toBeDefined(); expect(w?.classification).toBe('close-approach'); expect(w?.exactDates).toEqual([]);
      expect(w?.closestOrb).toBeGreaterThan(0.1); expect(w?.closestDate.slice(0,7)).toBe('2026-12');
    } finally {vi.useRealTimers();}
  });
  it('solver callback is respected and a station-before-target is never exact',()=>{
    const start=Date.UTC(2026,0,1),end=start+10*86400000;
    const misses=findExactHits('Saturn',10,start,end,ms=>9.9-Math.pow((ms-start)/86400000-5,2)*0.01);
    expect(misses).toEqual([]);
    const hits=findExactHits('Saturn',10,start,end,ms=>5+(ms-start)/86400000);
    expect(hits).toHaveLength(1); expect(Math.abs(hits[0].ms-(start+5*86400000))).toBeLessThan(1000);
  });
  it('Jupiter trine DSC survives relationship relevance selection',()=>{
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-24T00:00Z'));
    try {
      const data=buildDeterministicTimingData(natal,18,15,'relationship');
      expect(data.section?.transits.some(t=>t.planet==='Jupiter' && t.aspect==='trine' && t.natal_point.includes('Descendant'))).toBe(true);
    }finally{vi.useRealTimers();}
  });
});

describe('fail-only structured reading gate',()=>{
  const facts=buildVerifiedReadingFacts(natal,null,new Date('2026-10-24T12:00Z'),0);
  it('blocks SR prose when SR is absent',()=>expect(validateVerifiedReading('Solar Return Venus in Libra suggests more invitations.',facts)).toContain('Solar Return claims without Solar Return data'));
  it('allows a missing-data notice',()=>expect(validateVerifiedReading('Solar Return data is unavailable. This section cannot be read yet.',facts)).toEqual([]));
  it('blocks invented behavioral history',()=>expect(validateVerifiedReading('You keep choosing unavailable partners.',facts)).toContain('Unsupported behavioral history'));
  it('blocks an invented Moon opposition DSC',()=>expect(validateVerifiedReading('Natal Moon opposition Descendant.',facts)).toContain('Unverified aspect claim'));
  it('accepts the verified Moon square DSC',()=>expect(validateVerifiedReading('Natal Moon square Descendant (orb 0.17°).',facts)).toEqual([]));
  it('blocks an invented evidence identifier',()=>expect(validateVerifiedReading('[evidence:natal:made-up]',facts)).toContain('Unknown evidence reference'));
  it('blocks a fabricated exact transit date',()=>{
    const f={...facts,contacts:[...facts.contacts,{id:'transit-to-natal:Saturn:opposition:Mars',layer:'transit-to-natal',planet1:'Saturn',planet2:'Mars',aspect:'opposition',orb:0.5,exactDates:[],classification:'close-approach'}]};
    expect(validateVerifiedReading('Transiting Saturn opposition natal Mars is exact on 2026-12-10.',f)).toContain('Unverified exact transit date');
  });
});
