/**
 * Oracle-level AI prompt for practitioner screen view.
 * This produces a deeply synthesized reading — NOT a report.
 */
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

export const buildChartDataBlock = (
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): string => {
  const lines: string[] = [];
  const name = natalChart.name || 'Subject';

  // Natal chart
  lines.push('NATAL CHART:');
  const planets = natalChart.planets || {};
  for (const [p, pos] of Object.entries(planets)) {
    if (pos?.sign) {
      lines.push(`  ${p}: ${pos.sign} ${pos.degree || 0}°${pos.minutes ? `${pos.minutes}'` : ''}${(pos as any).isRetrograde ? ' Rx' : ''}`);
    }
  }

  // Solar Return chart
  lines.push('\nSOLAR RETURN CHART:');
  const srPlanets = srChart.planets || {};
  for (const [p, pos] of Object.entries(srPlanets)) {
    if (pos?.sign) {
      const srH = analysis.planetSRHouses?.[p];
      const overlay = analysis.houseOverlays?.find(o => o.planet === p);
      lines.push(`  SR ${p}: ${pos.sign} ${pos.degree || 0}°${pos.minutes ? `${pos.minutes}'` : ''}${(pos as any).isRetrograde ? ' Rx' : ''} — SR House ${srH || '—'}, Natal House ${overlay?.natalHouse || '—'}`);
    }
  }

  // SR Ascendant
  if (analysis.yearlyTheme) {
    lines.push(`\nSR ASCENDANT: ${analysis.yearlyTheme.ascendantSign} Rising`);
    lines.push(`  Ruler: ${analysis.yearlyTheme.ascendantRuler} in ${analysis.yearlyTheme.ascendantRulerSign}${analysis.yearlyTheme.ascendantRulerHouse ? ` (SR House ${analysis.yearlyTheme.ascendantRulerHouse})` : ''}`);
  }

  // Morin technique
  if (analysis.srAscRulerInNatal) {
    lines.push(`  SR ASC Ruler in Natal House ${analysis.srAscRulerInNatal.rulerNatalHouse || '—'} (${analysis.srAscRulerInNatal.rulerNatalHouseTheme || ''})`);
  }

  // Profection
  if (analysis.profectionYear) {
    lines.push(`\nPROFECTION YEAR:`);
    lines.push(`  Age: ${analysis.profectionYear.age}`);
    lines.push(`  Activated House: ${analysis.profectionYear.houseNumber}`);
    lines.push(`  Time Lord: ${analysis.profectionYear.timeLord} in ${analysis.profectionYear.timeLordSRSign || '—'}${analysis.profectionYear.timeLordSRHouse ? ` (SR House ${analysis.profectionYear.timeLordSRHouse})` : ''}`);
    if (analysis.profectionYear.overlap) lines.push(`  (Time Lord overlaps with chart ruler)`);
  }

  // Lord of the Year
  if (analysis.lordOfTheYear) {
    lines.push(`\nLORD OF THE YEAR: ${analysis.lordOfTheYear.planet} in ${analysis.lordOfTheYear.srSign} ${analysis.lordOfTheYear.srDegree}° — ${analysis.lordOfTheYear.dignity}${analysis.lordOfTheYear.isRetrograde ? ' Rx' : ''}`);
  }

  // Moon
  lines.push(`\nMOON:`);
  lines.push(`  Sign: ${analysis.moonSign}, SR House ${analysis.moonHouse?.house || '—'}, Natal House ${analysis.moonNatalHouse?.house || '—'}`);
  if (analysis.moonPhase) lines.push(`  Phase: ${analysis.moonPhase.phase}${analysis.moonPhase.isEclipse ? ' (near eclipse)' : ''}`);
  lines.push(`  Angularity: ${analysis.moonAngularity || '—'}`);
  if (analysis.moonVOC) lines.push(`  VOID OF COURSE (unaspected) — major theme`);
  if (analysis.moonLateDegree) lines.push(`  Late degree (25+) — emotional transitions`);
  if (analysis.moonMetonicAges?.length) lines.push(`  Metonic ages: ${analysis.moonMetonicAges.join(', ')}`);

  // Stelliums
  if (analysis.stelliums?.length > 0) {
    lines.push(`\nSTELLIUMS:`);
    analysis.stelliums.forEach(s => {
      lines.push(`  ${s.planets.join(', ')} in ${s.location}`);
    });
  }

  // Key aspects
  if (analysis.srToNatalAspects?.length > 0) {
    lines.push(`\nKEY ASPECTS (SR to Natal):`);
    analysis.srToNatalAspects.slice(0, 10).forEach(a => {
      lines.push(`  SR ${a.planet1} ${a.type} Natal ${a.planet2} — ${a.orb}° orb`);
    });
  }

  // Degree conduits
  if (analysis.natalDegreeConduits?.length > 0) {
    lines.push(`\nDEGREE CONDUITS:`);
    analysis.natalDegreeConduits.forEach(d => {
      lines.push(`  SR ${d.srPlanet} at ${d.degree}° ${d.srSign} on Natal ${d.natalPlanet} (${d.orb}° orb)`);
    });
  }

  // Repeated themes
  if (analysis.repeatedThemes?.length > 0) {
    lines.push(`\nREPEATED THEMES:`);
    analysis.repeatedThemes.forEach(t => lines.push(`  ${t.description}`));
  }

  // Elements & modality
  if (analysis.elementBalance) {
    lines.push(`\nELEMENTS: Fire ${analysis.elementBalance.fire}, Earth ${analysis.elementBalance.earth}, Air ${analysis.elementBalance.air}, Water ${analysis.elementBalance.water} — Dominant: ${analysis.elementBalance.dominant}`);
  }

  // Angular planets
  if (analysis.angularPlanets?.length > 0) {
    lines.push(`ANGULAR PLANETS: ${analysis.angularPlanets.join(', ')}`);
  }

  // Saturn
  if (analysis.saturnFocus) {
    lines.push(`SATURN: ${analysis.saturnFocus.sign} in SR House ${analysis.saturnFocus.house || '—'}${analysis.saturnFocus.isRetrograde ? ' Rx' : ''}`);
  }

  // Nodes
  if (analysis.nodesFocus) {
    lines.push(`NORTH NODE: ${analysis.nodesFocus.sign} in SR House ${analysis.nodesFocus.house || '—'}`);
  }

  return lines.join('\n');
};

export const buildOraclePrompt = (
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): string => {
  const chartData = buildChartDataBlock(analysis, srChart, natalChart);

  return `You are a master astrologer with 40 years of experience.
You have studied with Lynn Bell, Robert Hand, and Bernadette Brady.
You speak with the authority of deep knowledge and the warmth of genuine care.
You are giving a private reading to a fellow astrologer — so you can use 
technical language, but your insight must go beyond technique into meaning.

You are NOT writing a report. You are speaking as if sitting across from 
this person. Your reading should feel like revelation, not recitation.

CHART DATA FOR THIS READING:
${chartData}

YOUR TASK:
Write a 400–600 word oracle reading for this solar return year.
Structure it as flowing paragraphs, not bullet points or sections.

REQUIREMENTS:
1. Open with the single most important pattern you see — the one thing
   that defines this year above all others. Make it specific to THIS chart.
   
2. Weave together at least 3 techniques (profection + Time Lord + SR Moon 
   + stellium + key aspect + degree conduit — use whatever is strongest).
   Don't list them separately. Synthesize them into one narrative.

3. Identify the tension or paradox in the chart — what two energies are
   pulling against each other and what that means for growth.

4. Name one specific window from the key aspects when something
   important is likely to crystallize. Be specific.

5. Close with what this year is really asking of this person at a soul level.
   Not what they should DO — what they are being invited to BECOME.

VOICE:
- Authoritative but warm. Wise but direct.
- No hedging phrases like "this may suggest" or "you might find"
- No generic affirmations ("you are strong", "trust yourself")
- Every sentence must be grounded in the chart data provided
- If something looks hard, say so clearly and with compassion
- If something looks fortunate, name it specifically

HALLUCINATION PREVENTION — CRITICAL:
- Only interpret data that is explicitly provided in the chart data block
- Do not infer planetary positions that are not stated
- Do not assume aspects that are not listed
- Do not reference historical events or external world events
- If a data point is missing, skip it — do not fill in with assumptions
- Planet positions, house placements, and aspects must match the data exactly
- The SR Moon is a STATIC SNAPSHOT — it does NOT advance 1°/month

FORMAT:
- 3–5 paragraphs
- No headers, no bullet points, no section labels
- No sign emojis or symbols
- Write in second person ("you", "your year", "you are being asked")
- Plain text only — no markdown bold or italics`;
};
