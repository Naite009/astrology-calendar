import type { SolarReturnAnalysis } from './solarReturnAnalysis';
import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { getHouseLivedInterpretation, getNatalAspectExpression } from './interpretation/psychologicalFunctions';
import type { RankedAspect } from './aspectRanking';
import { buildSolarReturnProgressionContext, resolveSolarReturnProvenance } from './solarReturnProvenance';
import { signPositionToLongitude } from './ephemerisEngine';

const majors = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant','MC','IC','Descendant']);
export function buildSolarReturnEvidenceSynthesis(analysis: SolarReturnAnalysis, sr: SolarReturnChart, natal: NatalChart) {
  const format = (chart: NatalChart, body: string) => {
    const pos = chart.planets[body as keyof typeof chart.planets];
    return pos ? `${body} ${pos.degree}°${pos.minutes || 0}′ ${pos.sign}${pos.isRetrograde ? ' ℞' : ''}` : body;
  };
  const themes: { title: string; meaning: string; evidence: string[]; layer: string }[] = [];
  const prof = analysis.profectionYear;
  if (prof) {
    const arena = getHouseLivedInterpretation(prof.houseNumber);
    const route = getHouseLivedInterpretation(prof.timeLordSRHouse);
    themes.push({ title: 'Where the year asks for attention', layer: 'Annual whole-sign profection and Solar Return',
      meaning: `${arena?.attention || ''} ${prof.timeLordSRHouse && prof.timeLordSRHouse !== prof.houseNumber ? `The return placement of ${prof.timeLord} connects this with ${route?.focus.toLowerCase() || 'another area'}. The point is how those areas meet in actual choices, not that one cancels the other.` : ''}`,
      evidence: [`Age ${prof.age}: whole-sign House ${prof.houseNumber}, ${prof.natalCuspSign}, ruled by ${prof.timeLord}.`, `Solar Return ${format(sr, prof.timeLord)}, House ${prof.timeLordSRHouse || 'unknown'}.`] });
  }
  const sunHouse = analysis.sunHouse.house;
  const moonHouse = analysis.moonHouse.house;
  if (sunHouse) {
    const sun = getHouseLivedInterpretation(sunHouse), moon = getHouseLivedInterpretation(moonHouse);
    themes.push({ title: 'Purpose and emotional attention', layer: 'Solar Return',
      meaning: `${sun?.attention || ''} ${moonHouse && moonHouse !== sunHouse ? `The Moon draws attention to ${moon?.focus.toLowerCase()}. You may care about the first area while needing room for the second; compare that possibility with what you actually notice.` : 'The Sun and Moon direct attention toward the same area, connecting personal priorities with what feels important day to day.'} ${analysis.moonPhase?.description || ''}`,
      evidence: [`Solar Return ${format(sr, 'Sun')}, House ${sunHouse}.`, `Solar Return ${format(sr, 'Moon')}, House ${moonHouse || 'unknown'}; ${analysis.moonPhase?.phase || 'phase unknown'} at ${analysis.moonPhase?.phaseAngle ?? '?'}°.`] });
  }
  const key = new Set(['Sun','Moon',analysis.yearlyTheme?.ascendantRuler,prof?.timeLord].filter(Boolean));
  const contacts = [...analysis.srToNatalAspects, ...analysis.srInternalAspects]
    .filter(a => majors.has(a.planet1) && majors.has(a.planet2) && a.orb <= 3 && (key.has(a.planet1) || key.has(a.planet2)))
    .sort((a,b) => a.orb - b.orb).slice(0, 3);
  for (const contact of contacts) {
    const chartB = contact.source === 'sr-to-natal' ? natal : sr;
    const a = sr.planets[contact.planet1 as keyof typeof sr.planets], b = chartB.planets[contact.planet2 as keyof typeof chartB.planets];
    const meaning = getNatalAspectExpression({ a: contact.planet1, b: contact.planet2, aspect: contact.type.toLowerCase(), orb: contact.orb, aSign: a?.sign || '', bSign: b?.sign || '', aHouse: analysis.planetSRHouses[contact.planet1], bHouse: null } as RankedAspect)
      .replace(/They may/g, 'You may').replace(/they /g, 'you ').replace(/their /g, 'your ').replace(/themselves/g, 'yourself');
    themes.push({ title: contact.label, layer: contact.source === 'sr-to-natal' ? 'Solar Return contact to a natal pattern' : 'Solar Return internal interaction',
      meaning: `${contact.source === 'sr-to-natal' ? 'This annual contact may make an existing natal pattern more noticeable, rather than replacing your birth-chart temperament. ' : 'Read this as an annual emphasis, not a permanent personality description. '}${meaning}`,
      evidence: [`Solar Return ${format(sr, contact.planet1)}, House ${analysis.planetSRHouses[contact.planet1] || 'unknown'}; ${contact.source === 'sr-to-natal' ? 'natal' : 'Solar Return'} ${format(chartB, contact.planet2)}.`, `${contact.label}; orb ${contact.orb}°.`] });
  }
  const progressions = buildSolarReturnProgressionContext(sr, natal);
  const moon = progressions?.moonInfo;
  const longerTerm = moon ? {
    title: 'The longer emotional chapter', layer: 'Secondary progression, distinct from the Solar Return Moon',
    meaning: `The progressed Moon is ${moon.exactDegree.toFixed(2)}° ${moon.sign}, in natal House ${moon.house || 'unknown'}. ${getHouseLivedInterpretation(moon.house)?.attention || ''} This unfolds over a longer period than the annual return. The next sign ingress is calculated for ${moon.signChangeDate.toISOString().slice(0,10)}; a sign change is symbolic context, not proof that a life event will happen.`,
    evidence: [`Reference ${progressions.referenceDate}; progressed ephemeris date ${progressions.progressedDate}.`, `Progressed Moon ${moon.exactDegree.toFixed(3)}° ${moon.sign}; ${moon.detailedPhase.phaseName}, ${moon.detailedPhase.phaseAngle.toFixed(3)}°.`, ...(moon.houseChange.houseChangeDate ? [`Next natal house cusp crossing ${moon.houseChange.houseChangeDate.toISOString()}.`] : [])],
  } : null;
  void signPositionToLongitude;
  return { methodology: 'Major planets and key rulers, tight contacts first; no minor-body themes or invented event dates. Interpretations are symbolic hypotheses.', themes, longerTerm, progressions, calculationMetadata: resolveSolarReturnProvenance(sr, natal) };
}