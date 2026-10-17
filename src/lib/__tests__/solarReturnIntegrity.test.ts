import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { lunarPhaseName } from '@/lib/lunarPhaseConvention';
import { analyzeSolarReturn } from '@/lib/solarReturnAnalysis';
import { resolveSolarReturnProvenance } from '@/lib/solarReturnProvenance';
import { calculateSecondaryProgressions, getProgressedMoonInfo } from '@/lib/secondaryProgressions';
import { calculatePlanetaryHours } from '@/lib/planetaryHours';
import { buildFullJsonStandalone } from '@/components/SolarReturnPDFExport';
import { SOLAR_RETURN_REPORT_VERSION, validateSolarReturnReport, validateSolarReturnReading } from '../../../supabase/functions/_shared/solarReturnReportValidation';
import { computeBody } from '@/lib/ephemerisEngine';
import { laurenNatal, laurenReturn } from '@/test/fixtures/solarReturnLauren';

describe('Solar Return concrete integrity regressions', () => {
  it.each([[0,'New Moon'],[22.499,'New Moon'],[22.5,'Waxing Crescent'],[67.5,'First Quarter'],[112.5,'Waxing Gibbous'],[122.45,'Waxing Gibbous'],[157.5,'Full Moon'],[202.5,'Waning Gibbous'],[221.98,'Waning Gibbous'],[247.5,'Last Quarter'],[292.5,'Balsamic'],[337.5,'New Moon'],[360,'New Moon']] as const)('phase %s is %s', (angle,label) => expect(lunarPhaseName(angle)).toBe(label));
  it('keeps age-50 whole-sign profection and all three ruler roles distinct', () => {
    const a = analyzeSolarReturn(laurenReturn,laurenNatal);
    expect(a.profectionYear).toMatchObject({ age:50, houseNumber:3, natalCuspSign:'Sagittarius', timeLord:'Jupiter' });
    expect(a.natalChartRuler?.planet).toBe('Venus');
    expect(a.yearlyTheme?.ascendantRuler).toBe('Mars');
    expect(a.srCuspSigns?.[10]).toBe('Virgo');
    expect(a.moonPhase?.phase).toBe('Waxing Gibbous');
    expect(a.moonMetonicAges).toEqual([]);
  });
  it('does not pretend an absent imported return time or house system was stored', () => {
    const m=resolveSolarReturnProvenance(laurenReturn,laurenNatal);
    expect(m.instantSource).toBe('recalculated-from-stored-natal-sun');
    expect(m.storedReturnInstantUTC).toBeNull();
    expect(m.houseSystem).toBeNull();
    expect(m.returnInstantUTC?.slice(0,10)).toBe('2026-10-21');
    const date=new Date(m.returnInstantUTC || 'invalid');
    const sun=computeBody('Sun',date);
    expect(sun.ok && Math.abs(sun.longitude-208.183333)).toBeLessThan(0.002);
  });
  it('uses the 1976 historical UTC birth instant for day-for-year progression', () => {
    const p=calculateSecondaryProgressions(laurenNatal,new Date('2026-10-21T11:12:00Z'));
    expect(p?.progressedDate.toISOString().slice(0,10)).toBe('1976-12-10');
    expect(p?.ageInYears).toBeCloseTo(49.9986,3);
    expect(p?.planets.Moon.longitude).toBeCloseTo(120.513,1);
    if (!p) throw new Error('No progressions');
    const m=getProgressedMoonInfo(p,laurenNatal);
    expect(m?.house).toBe(10);
    expect(m?.sign).toBe('Leo');
    expect(m?.signChangeDate.getTime()).toBeGreaterThan(Date.parse('2027-01-01'));
  });
  it('planetary hours use the 2026 local solar day with consecutive Chaldean rulers', () => {
    const date=new Date('2026-10-21T13:49:00Z');
    const hours=calculatePlanetaryHours(date,38.9072,-77.0369);
    expect(hours).toHaveLength(24);
    expect(hours[0].planet).toBe('Mercury');
    expect(hours[1].planet).toBe('Moon');
    expect(hours[2].planet).toBe('Saturn');
    expect(hours[0].start.getUTCFullYear()).toBe(2026);
    expect(hours.some(h=>h.start<=date && h.end>date)).toBe(true);
    expect(hours[12].start.getTime()).toBe(hours[11].end.getTime());
  });
  it('machine fields survive export and the report uses the correct lord', () => {
    const a=analyzeSolarReturn(laurenReturn,laurenNatal);
    const json=buildFullJsonStandalone(a,laurenReturn,laurenNatal);
    expect(json.name).toBe('Lauren Newman');
    expect(json.birthDate).toBe('1976-10-21');
    expect(json.cakeImageUrl.endsWith('libra.png')).toBe(true);
    expect(json.reportVersion).toBe(SOLAR_RETURN_REPORT_VERSION);
    expect(json.lordOfTheYear?.planet).toBe('Jupiter');
    expect(json.natalChartRuler?.planet).toBe('Venus');
    expect(json.rulers.solarReturnChartRuler).toBe('Mars');
    expect(validateSolarReturnReport(json)).toEqual([]);
    expect(validateSolarReturnReport({...json,birthDate:'1976-10-21.'})).toContain('Invalid birth date');
    expect(validateSolarReturnReport({...json,lordOfTheYear:{planet:'Venus'}})).toContain('Lord of the year differs from the profection lord');
    expect(validateSolarReturnReport({...json,moonPhase:{phase:'First Quarter',phaseAngle:122.45}})).toContain('Moon phase label conflicts with its angle');
  });
  it('rejects explicitly mixed chart identities and wrong stored return instants',()=>{
    expect(()=>resolveSolarReturnProvenance({...laurenReturn,natalChartId:'other'},laurenNatal)).toThrow('different natal chart');
    const m=resolveSolarReturnProvenance({...laurenReturn,solarReturnDateTime:'2026-05-01T00:00:00Z'},laurenNatal);
    expect(m.instantSource).toBe('recalculated-from-stored-natal-sun');
    expect(m.warnings.join(' ')).toContain('rejected');
  });
  it('withholds blank and prohibited reading claims',()=>{
    expect(validateSolarReturnReading('')).not.toEqual([]);
    expect(validateSolarReturnReading('## Story\n'+'This is fated. '.repeat(30))).toContain('Reading contains unsupported or generic claims');
  });
  it('a second rising chart profects by whole signs rather than quadrant cusps',()=>{
    const natal={...laurenNatal,houseCusps:{...laurenNatal.houseCusps,house1:{sign:'Scorpio',degree:26,minutes:57}}};
    expect(analyzeSolarReturn(laurenReturn,natal).profectionYear).toMatchObject({natalCuspSign:'Capricorn',timeLord:'Saturn'});
  });
});