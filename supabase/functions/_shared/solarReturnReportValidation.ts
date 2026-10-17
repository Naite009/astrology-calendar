/** Shared browser/function contract. Validation never changes a machine field. */
export const SOLAR_RETURN_REPORT_VERSION = 'sr-integrity-2026-10-17-v1';
const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const rulers = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
const phases = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Balsamic'];
export function validateSolarReturnReport(report: Record<string, any>): string[] {
  const errors: string[] = [];
  if (report.reportVersion !== SOLAR_RETURN_REPORT_VERSION) errors.push('This report needs regeneration with the corrected version');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(report.birthDate || '')) errors.push('Invalid birth date');
  const birthYear = Number(report.birthDate?.slice(0, 4));
  const age = report.solarReturnYear - birthYear;
  const p = report.profectionYear;
  if (p && (p.age !== age || p.houseNumber !== (age % 12) + 1)) errors.push('Conflicting profection age or house');
  const ascIndex = signs.indexOf(report.natalRising);
  if (p && ascIndex >= 0 && p.timeLord !== rulers[(ascIndex + age % 12) % 12]) errors.push('Conflicting whole-sign profection lord');
  if (report.lordOfTheYear?.planet && report.lordOfTheYear.planet !== p?.timeLord) errors.push('Lord of the year differs from the profection lord');
  const m = report.moonPhase;
  if (m && Number.isFinite(m.phaseAngle)) {
    const index = Math.floor(((((m.phaseAngle % 360) + 360 + 22.5) % 360)) / 45);
    if (m.phase !== phases[index]) errors.push('Moon phase label conflicts with its angle');
  }
  const identity = report.calculationMetadata;
  if (identity?.linkedNatalChartId && identity.linkedNatalChartId !== identity.natalChartId) errors.push('Return and natal chart identities differ');
  const instant = report.calculationMetadata?.returnInstantUTC;
  if (instant && (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(instant) || new Date(instant).getUTCFullYear() !== report.solarReturnYear)) errors.push('Invalid return timestamp');
  for (const hour of report.planetaryHoursAtSR?.allHours || []) {
    if (!Number.isFinite(Date.parse(hour.start)) || !Number.isFinite(Date.parse(hour.end)) || Date.parse(hour.end) <= Date.parse(hour.start)) errors.push('Invalid planetary-hour timestamps');
    if (instant && Math.abs(Date.parse(hour.start) - Date.parse(instant)) > 2 * 86400000) errors.push('Planetary hours use a different date from the return');
  }
  const targets: Record<string, number> = { Conjunction: 0, Sextile: 60, Square: 90, Trine: 120, Quincunx: 150, Opposition: 180 };
  const wheel = report.chartWheelData;
  for (const aspect of [...(report.srToNatalAspects || []), ...(report.srInternalAspects || [])]) {
    if (!aspect.source || !aspect.label) errors.push('Aspect is missing chart provenance');
    if (!Number.isFinite(aspect.orb) || aspect.orb < 0) errors.push('Invalid aspect orb');
    const type = aspect.type || aspect.aspectType;
    if (!(type in targets)) errors.push('Unsupported aspect type');
  }
  if (wheel?.srPlanets && wheel?.natalPlanets) {
    for (const aspect of [...(report.srToNatalAspects || []), ...(report.srInternalAspects || [])]) {
      const first = wheel.srPlanets[aspect.planet1 || aspect.srPlanet];
      const pool = aspect.source === 'sr-to-natal' ? wheel.natalPlanets : wheel.srPlanets;
      const second = pool[aspect.planet2 || aspect.natalPlanet];
      const angle = targets[aspect.type || aspect.aspectType];
      if (first && second && Number.isFinite(angle)) {
        const separation = Math.abs(((first.absDeg - second.absDeg + 540) % 360) - 180);
        if (Math.abs(Math.abs(separation - angle) - aspect.orb) > 0.025) errors.push('Aspect geometry conflicts with exported positions');
      }
    }
    const sun = wheel.srPlanets.Sun, moon = wheel.srPlanets.Moon;
    if (sun && moon && m && Math.abs((((moon.absDeg - sun.absDeg) % 360 + 360) % 360) - m.phaseAngle) > 0.025) errors.push('Moon phase angle conflicts with exported positions');
    if (wheel.srPlanets.Sun?.retrograde || wheel.srPlanets.Moon?.retrograde) errors.push('Sun or Moon incorrectly marked retrograde');
  }
  for (const [key, position] of Object.entries(wheel?.srCusps || {}) as [string, any][]) {
    const house = Number(key.replace('house',''));
    if (report.rulers?.returnCuspSigns?.[house] && report.rulers.returnCuspSigns[house] !== position.sign) errors.push('Return cusp sign conflicts with ruler context');
  }
  return [...new Set(errors)];
}

/** Reject harmful/unsupported prose rather than trying to manufacture a replacement. */
export function validateSolarReturnReading(text: string): string[] {
  const errors: string[] = [];
  if (text.trim().length < 200) errors.push('Reading is empty or incomplete');
  if (!/^## /m.test(text)) errors.push('Reading lacks the required sections');
  if (/(?:uses? (?:a )?\w+ style|good place to steer|two valid needs|trust (?:the )?process|crisis.in.action|fated|destined|guaranteed|illness|trauma|your mother|you will (?:lose|suffer|become ill))/i.test(text)) errors.push('Reading contains unsupported or generic claims');
  if (/[\u2014\u2013]/.test(text)) errors.push('Reading contains prohibited dashes');
  return errors;
}