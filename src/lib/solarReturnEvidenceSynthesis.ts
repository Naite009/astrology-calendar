import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { buildSolarReturnProgressionContext, resolveSolarReturnProvenance } from './solarReturnProvenance';
import { solarReturnHouseMeaning, solarReturnProfectionMeaning, solarReturnContactMeaning } from './solarReturnClientMeaning';
import { validateSolarReturnProse } from '../../supabase/functions/_shared/solarReturnProseQuality';
import { guardSolarReturnProse } from './solarReturnProseBoundary';

const majors = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant','MC','IC','Descendant']);
export function buildSolarReturnEvidenceSynthesis(analysis: SolarReturnAnalysis, sr: SolarReturnChart, natal: NatalChart) {
  const format = (chart: NatalChart, body: string) => {
    const pos = chart.planets[body as keyof typeof chart.planets];
    return pos ? `${body} ${pos.degree}°${pos.minutes || 0}′ ${pos.sign}${pos.isRetrograde ? ' ℞' : ''}` : body;
  };
  const themes: { title: string; meaning: string; evidence: string[]; layer: string }[] = [];
  const prof = analysis.profectionYear;
  if (prof) {
    themes.push({ title: 'Where the year asks for attention', layer: 'Annual whole-sign profection and Solar Return',
      meaning: solarReturnProfectionMeaning(prof.houseNumber, prof.timeLord, prof.timeLordSRHouse),
      evidence: [`Age ${prof.age}: whole-sign House ${prof.houseNumber}, ${prof.natalCuspSign}, ruled by ${prof.timeLord}.`, `Solar Return ${format(sr, prof.timeLord)}, House ${prof.timeLordSRHouse || 'unknown'}.`] });
  }
  const sunHouse = analysis.sunHouse.house;
  const moonHouse = analysis.moonHouse.house;
  if (sunHouse) {
    themes.push({ title: 'Purpose and emotional attention', layer: 'Solar Return',
      meaning: solarReturnHouseMeaning(sunHouse, 'Sun'),
      evidence: [`Solar Return ${format(sr, 'Sun')}, House ${sunHouse}.`, `Solar Return ${format(sr, 'Moon')}, House ${moonHouse || 'unknown'}; ${analysis.moonPhase?.phase || 'phase unknown'} at ${analysis.moonPhase?.phaseAngle ?? '?'}°.`] });
  }
  if (moonHouse && moonHouse !== sunHouse) themes.push({ title: 'What affects your day-to-day sense of ease', layer: 'Solar Return', meaning: solarReturnHouseMeaning(moonHouse, 'Moon'), evidence: [`Solar Return ${format(sr, 'Moon')}, House ${moonHouse}.`] });
  const angular = (analysis.angularPlanetsDetailed || []).filter(a => majors.has(a.planet)).sort((a,b) => a.orb - b.orb)[0];
  if (angular && analysis.planetSRHouses[angular.planet]) themes.push({ title: 'Where your choices may be more visible', layer: 'Solar Return angular emphasis', meaning: solarReturnHouseMeaning(analysis.planetSRHouses[angular.planet], angular.planet), evidence: [`Solar Return ${format(sr, angular.planet)}, House ${analysis.planetSRHouses[angular.planet]}; near ${angular.angle}, orb ${angular.orb}°.`] });
  const key = new Set(['Sun','Moon',analysis.yearlyTheme?.ascendantRuler,prof?.timeLord].filter(Boolean));
  const contacts = [...analysis.srToNatalAspects, ...analysis.srInternalAspects]
    .filter(a => majors.has(a.planet1) && majors.has(a.planet2) && a.orb <= 3 && (key.has(a.planet1) || key.has(a.planet2)))
    .sort((a,b) => a.orb - b.orb).slice(0, 3);
  for (const contact of contacts) {
    const chartB = contact.source === 'sr-to-natal' ? natal : sr;
    const a = sr.planets[contact.planet1 as keyof typeof sr.planets], b = chartB.planets[contact.planet2 as keyof typeof chartB.planets];
    const meaning = solarReturnContactMeaning({ planet1: contact.planet1, planet2: contact.planet2, type: contact.type, orb: contact.orb, sign1: a?.sign, sign2: b?.sign, house1: analysis.planetSRHouses[contact.planet1] });
    themes.push({ title: contact.source === 'sr-to-natal' ? `SR ${contact.planet1} ${contact.type.toLowerCase()} natal ${contact.planet2}` : `SR ${contact.planet1} ${contact.type.toLowerCase()} SR ${contact.planet2}`, layer: contact.source === 'sr-to-natal' ? 'Solar Return-to-natal contact' : 'Solar Return-to-Solar Return aspect',
      meaning,
      evidence: [`Solar Return ${format(sr, contact.planet1)}, House ${analysis.planetSRHouses[contact.planet1] || 'unknown'}; ${contact.source === 'sr-to-natal' ? 'natal' : 'Solar Return'} ${format(chartB, contact.planet2)}.`, `${contact.source === 'sr-to-natal' ? `SR ${contact.planet1} ${contact.type.toLowerCase()} natal ${contact.planet2} (SR-to-natal)` : `SR ${contact.planet1} ${contact.type.toLowerCase()} SR ${contact.planet2} (SR-to-SR)`}; orb ${contact.orb}°.`] });
  }
  const progressions = buildSolarReturnProgressionContext(sr, natal);
  const moon = progressions?.moonInfo;
  const longerTerm = moon ? {
    title: 'The longer emotional chapter', layer: 'Secondary progression, distinct from the Solar Return Moon',
    meaning: `${solarReturnHouseMeaning(moon.house, 'Moon')} You may notice this developing beyond one birthday year; the calculated sign change is a timing reference, not a promise of an event.`,
    evidence: [`Reference ${progressions.referenceDate}; progressed ephemeris date ${progressions.progressedDate}.`, `Progressed Moon ${moon.exactDegree.toFixed(3)}° ${moon.sign}, natal House ${moon.house || 'unknown'}; ${moon.detailedPhase.phaseName}, ${moon.detailedPhase.phaseAngle.toFixed(3)}°.`, `Next progressed sign ingress ${moon.signChangeDate.toISOString().slice(0,10)}.`, ...(moon.houseChange.houseChangeDate ? [`Next natal house cusp crossing ${moon.houseChange.houseChangeDate.toISOString()}.`] : [])],
  } : null;
  return guardSolarReturnProse({ houseMethodology: 'Natal & Solar Return houses: Placidus. Annual profection: Whole Sign.', methodology: 'Major planets and key rulers, tight contacts first; no minor-body themes or invented event dates. Interpretations are symbolic hypotheses.', themes: themes.filter(t => t.meaning && !validateSolarReturnProse(t.meaning).length), longerTerm: longerTerm && !validateSolarReturnProse(longerTerm.meaning).length ? longerTerm : null, progressions, calculationMetadata: resolveSolarReturnProvenance(sr, natal) });
}