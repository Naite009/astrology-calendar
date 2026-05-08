/**
 * Morning Cosmic Weather digest — deterministic, house-aware, and personalized.
 * Built from the same ephemeris/transit logic already used in the app.
 */

import { getMoonPhase, getPlanetaryPositions, getExactLunarPhase, findNearestMajorPhaseTime } from './astrology';
import { findNextMoonSignChange, getVOCMoonDetails, formatVOCTime } from './voidOfCourseMoon';
import { formatSkyBlockForEmail, getEasternDateAtTime, getEasternMidnightDate } from './cosmicWeatherSkyBlock';
import { getTransitPlanetHouse, HOUSE_MEANINGS } from './houseCalculations';
import { calculateTransitAspects } from './transitAspects';
import { getDegreeMeaning } from './characterSynthesis';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGN_SYMBOL: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ASPECT_VERB: Record<string, string> = {
  conjunction: 'conjunct',
  opposition: 'opposite',
  square: 'square',
  trine: 'trine',
  sextile: 'sextile',
  quincunx: 'quincunx',
  semisextile: 'semi-sextile',
};

const PHASE_MEANING: Record<string, string> = {
  'New Moon': 'seed time, begin and set intention',
  'Waxing Crescent': 'momentum is building, keep feeding the new thing',
  'First Quarter': 'pressure to act, decide, and move through friction',
  'Waxing Gibbous': 'adjust, refine, and get the details right before the peak',
  'Full Moon': 'peak light, feelings and facts are fully visible',
  'Waning Gibbous': 'the peak already happened, now it is about processing, sharing, and making meaning',
  'Last Quarter': 'release what is not working, cut, clear, and reset',
  'Waning Crescent': 'rest, empty out, and prepare for the next cycle',
  'Balsamic Moon': 'deep rest and surrender, do less and listen more',
};

export interface MorningDigestArgs {
  date: Date;
  natalChart: NatalChart | null;
  recipientName?: string;
}

function formatET(value: Date): string {
  return value.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDegree(degree: number, minutes = 0): string {
  return `${Math.floor(degree)}°${String(minutes).padStart(2, '0')}'`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function houseLabel(house: number | null): string {
  if (!house) return 'house placement unavailable';
  const info = HOUSE_MEANINGS[house];
  return `${ordinal(house)} house${info ? `, ${info.lifeArea}` : ''}`;
}

function downshiftPhaseName(date: Date, phaseName: string, phaseAngle: number): string {
  const exact = getExactLunarPhase(date);
  if (phaseName === 'New Moon' && exact?.type !== 'New Moon') return phaseAngle < 180 ? 'Waxing Crescent' : 'Waning Crescent';
  if (phaseName === 'Full Moon' && exact?.type !== 'Full Moon') return phaseAngle < 180 ? 'Waxing Gibbous' : 'Waning Gibbous';
  return phaseName;
}

function buildMoonMomentLine(label: string, time: Date, natalChart: NatalChart | null): string {
  const positions = getPlanetaryPositions(time);
  const moon = positions.moon;
  const house = natalChart ? getTransitPlanetHouse(moon.signName, moon.degree, natalChart) : null;
  return `${label}: ☽ ${formatDegree(moon.degree, moon.minutes)} ${SIGN_SYMBOL[moon.signName] || ''} ${moon.signName}${house ? `, your ${ordinal(house)} house` : ''}`;
}

function buildMoonAspectTimeline(date: Date, natalChart: NatalChart): string[] {
  const midnight = getEasternMidnightDate(date);
  const noon = getEasternDateAtTime(date, 12, 0);
  const end = getEasternDateAtTime(date, 23, 59);
  const dayEnd = new Date(end.getTime());
  const signChange = findNextMoonSignChange(midnight);
  const moments = [
    { label: '12:00 AM ET', time: midnight },
    ...(signChange.time <= dayEnd ? [{ label: `${formatET(signChange.time)} ET`, time: signChange.time }] : []),
    { label: '12:00 PM ET', time: noon },
    { label: '11:59 PM ET', time: end },
  ];

  const best = new Map<string, { text: string; orb: number }>();

  for (const moment of moments) {
    const aspects = calculateTransitAspects(moment.time, getPlanetaryPositions(moment.time), natalChart)
      .filter(a => a.transitPlanet === 'Moon')
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));

    for (const aspect of aspects.slice(0, 5)) {
      const key = `${aspect.aspect}-${aspect.natalPlanet}`;
      const orb = parseFloat(aspect.orb);
      const entry = {
        text: `${moment.label}: ☽ ${ASPECT_VERB[aspect.aspect] || aspect.aspect} your natal ${aspect.natalPlanet}${aspect.natalHouse ? ` in the ${ordinal(aspect.natalHouse)}` : ''} (${orb.toFixed(1)}° orb)` ,
        orb,
      };
      const existing = best.get(key);
      if (!existing || orb < existing.orb) best.set(key, entry);
    }
  }

  return [...best.values()].sort((a, b) => a.orb - b.orb).slice(0, 5).map(x => x.text);
}

export function buildMorningDigest({ date, natalChart, recipientName }: MorningDigestArgs): string {
  const midnight = getEasternMidnightDate(date);
  const noon = getEasternDateAtTime(date, 12, 0);
  const end = getEasternDateAtTime(date, 23, 59);
  const phase = getMoonPhase(midnight);
  const phaseName = downshiftPhaseName(midnight, phase.phaseName, phase.phase);
  const exactPhase = getExactLunarPhase(midnight);
  const nearestMajor = !exactPhase && (phaseName === 'New Moon' || phaseName === 'Full Moon' || phaseName === 'First Quarter' || phaseName === 'Last Quarter')
    ? findNearestMajorPhaseTime(midnight, phaseName)
    : null;
  const midnightMoon = getPlanetaryPositions(midnight).moon;
  const noonMoon = getPlanetaryPositions(noon).moon;
  const endMoon = getPlanetaryPositions(end).moon;
  const signChange = findNextMoonSignChange(midnight);
  const voc = getVOCMoonDetails(midnight);
  const dayEnd = new Date(end.getTime());
  const degreeMeaning = getDegreeMeaning(midnightMoon.degree).meaning;
  const firstName = recipientName?.trim().split(/\s+/)[0];
  const moonHouse = natalChart ? getTransitPlanetHouse(midnightMoon.signName, midnightMoon.degree, natalChart) : null;
  const moonTimeline = [
    buildMoonMomentLine('12:00 AM ET', midnight, natalChart),
    ...(signChange.time <= dayEnd ? [buildMoonMomentLine(`${formatET(signChange.time)} ET`, signChange.time, natalChart)] : []),
    buildMoonMomentLine('12:00 PM ET', noon, natalChart),
    buildMoonMomentLine('11:59 PM ET', end, natalChart),
  ];

  const sections: string[] = [];
  sections.push(`${firstName ? `Good morning, ${firstName}.` : 'Good morning.'} Here is the part you cannot get just from knowing the sign.`);
  sections.push(formatSkyBlockForEmail(date));

  const moonSummaryBits = [
    `The Moon starts the day at ${formatDegree(midnightMoon.degree, midnightMoon.minutes)} ${midnightMoon.signName}`,
    signChange.time <= dayEnd ? `then changes signs at ${formatET(signChange.time)} ET` : `and does not change signs today`,
    `it is at ${formatDegree(noonMoon.degree, noonMoon.minutes)} by noon and ${formatDegree(endMoon.degree, endMoon.minutes)} by 11:59 PM ET`,
  ];

  sections.push([
    'THE MOON TODAY',
    moonSummaryBits.join('. ') + '.',
    `Phase: ${phaseName}, ${Math.round(phase.illumination * 100)}% illuminated. ${PHASE_MEANING[phaseName] || ''}.`,
    exactPhase
      ? `${exactPhase.type} is exact today at ${formatET(exactPhase.time)} ET.`
      : nearestMajor
        ? `Nearest major phase: ${nearestMajor.type} at ${formatET(nearestMajor.date)} ET ${nearestMajor.date < midnight ? 'already passed' : 'is coming up'}.`
        : '',
    `What the degree means: ${degreeMeaning}`,
    voc.isCurrentlyVOC && voc.end
      ? `Void of course now until ${formatVOCTime(voc.end)} ET, so do not treat this stretch as clean launch energy.`
      : (voc.isVOC && voc.start && voc.end
          ? `Void of course later: ${formatVOCTime(voc.start)} ET to ${formatVOCTime(voc.end)} ET.`
          : ''),
  ].filter(Boolean).join('\n'));

  if (natalChart) {
    const moonAspectLines = buildMoonAspectTimeline(date, natalChart);
    sections.push([
      'WHERE IT LANDS FOR YOU',
      moonHouse
        ? `At 12:00 AM ET the Moon is moving through your ${houseLabel(moonHouse)}.`
        : `Your house data was not available, so I can only give the sky timeline.`,
      ...moonTimeline.map(line => `• ${line}`),
      moonAspectLines.length
        ? 'Main Moon-to-natal hits today:\n' + moonAspectLines.map(line => `• ${line}`).join('\n')
        : 'The Moon is moving through your chart today, but it is not making a tight major hit to a natal point at the key checkpoints I checked.',
    ].join('\n'));
  }

  sections.push([
    'WHY THIS MATTERS',
    moonHouse
      ? `This is less about a generic ${midnightMoon.signName} Moon meaning, and more about your ${ordinal(moonHouse)} house getting stirred while the Moon changes degree, changes sign, and brushes your natal points.`
      : `What matters today is the Moon\'s timing, degree, and phase, not a canned sign paragraph.`,
    `The real story is the movement: ${formatDegree(midnightMoon.degree, midnightMoon.minutes)} at the start of the day, ${signChange.time <= dayEnd ? `a sign shift at ${formatET(signChange.time)} ET, ` : ''}${formatDegree(noonMoon.degree, noonMoon.minutes)} by noon, and ${formatDegree(endMoon.degree, endMoon.minutes)} by late night.`,
  ].join('\n'));

  return sections.join('\n\n');
}
