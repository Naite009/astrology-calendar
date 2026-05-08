/**
 * Morning Cosmic Weather digest — short, interpreted, and personalized.
 * Uses the same transit-ranking and felt-sense logic already used in the app.
 */

import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects, getDayType, getExactLunarPhase, findNearestMajorPhaseTime } from './astrology';
import { findNextMoonSignChange, getVOCMoonDetails, formatVOCTime } from './voidOfCourseMoon';
import { formatSkyBlockForEmail, getEasternDateAtTime, getEasternMidnightDate } from './cosmicWeatherSkyBlock';
import { getTransitPlanetHouse, HOUSE_MEANINGS } from './houseCalculations';
import { calculateTransitAspects, getTopTransitAspects, getFeltSenseDescription } from './transitAspects';
import { getPersonalizedTransitInterpretation } from './personalizedTransitInterpretations';
import { getDegreeMeaning } from './characterSynthesis';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGN_SYMBOL: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍', quincunx: '⚻', semisextile: '⚺',
};

const PHASE_MEANING: Record<string, string> = {
  'New Moon': 'fresh start energy, good for setting the tone',
  'Waxing Crescent': 'the new thing is taking shape, keep feeding it',
  'First Quarter': 'pressure to act, decide, and stop hesitating',
  'Waxing Gibbous': 'refine, edit, and fix what is not quite ready yet',
  'Full Moon': 'peak light, big feelings, and clear results',
  'Waning Gibbous': 'the peak already happened, now process it and make meaning out of it',
  'Last Quarter': 'cut loose what is draining you, simplify',
  'Waning Crescent': 'pull back, clear space, rest',
  'Balsamic Moon': 'deep rest, closure, and surrender',
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

function downshiftPhaseName(date: Date, phaseName: string, phaseAngle: number): string {
  const exact = getExactLunarPhase(date);
  if (phaseName === 'New Moon' && exact?.type !== 'New Moon') return phaseAngle < 180 ? 'Waxing Crescent' : 'Waning Crescent';
  if (phaseName === 'Full Moon' && exact?.type !== 'Full Moon') return phaseAngle < 180 ? 'Waxing Gibbous' : 'Waning Gibbous';
  return phaseName;
}

function moonTimelineLine(label: string, time: Date, chart: NatalChart | null): string {
  const moon = getPlanetaryPositions(time).moon;
  const house = chart ? getTransitPlanetHouse(moon.signName, moon.degree, chart) : null;
  const houseText = house && HOUSE_MEANINGS[house] ? `, your ${ordinal(house)} house of ${HOUSE_MEANINGS[house].keywords.toLowerCase()}` : '';
  return `${label}: ☽ ${formatDegree(moon.degree, moon.minutes)} ${SIGN_SYMBOL[moon.signName] || ''} ${moon.signName}${houseText}`;
}

export function buildMorningDigest({ date, natalChart, recipientName }: MorningDigestArgs): string {
  const midnight = getEasternMidnightDate(date);
  const noon = getEasternDateAtTime(date, 12, 0);
  const end = getEasternDateAtTime(date, 23, 59);
  const moonPhase = getMoonPhase(midnight);
  const phaseName = downshiftPhaseName(midnight, moonPhase.phaseName, moonPhase.phase);
  const phaseMeaning = PHASE_MEANING[phaseName] || '';
  const planets = getPlanetaryPositions(midnight);
  const aspects = calculateDailyAspects(planets);
  const dayType = getDayType(aspects, moonPhase);
  const exactPhase = getExactLunarPhase(midnight);
  const nearestMajor = !exactPhase && (phaseName === 'New Moon' || phaseName === 'Full Moon' || phaseName === 'First Quarter' || phaseName === 'Last Quarter')
    ? findNearestMajorPhaseTime(midnight, phaseName)
    : null;
  const moon = planets.moon;
  const noonMoon = getPlanetaryPositions(noon).moon;
  const endMoon = getPlanetaryPositions(end).moon;
  const signChange = findNextMoonSignChange(midnight);
  const voc = getVOCMoonDetails(midnight);
  const dayEnd = new Date(end.getTime());
  const firstName = recipientName?.trim().split(/\s+/)[0];

  const sections: string[] = [];
  sections.push(`${firstName ? `Good morning, ${firstName}.` : 'Good morning.'} Here is the short version that should actually help in bed.`);

  const moonIntro = [
    `Today carries a ${dayType.label.toLowerCase()} tone. ${dayType.description}.`,
    `The Moon starts at ${formatDegree(moon.degree, moon.minutes)} ${moon.signName}, is ${Math.round(moonPhase.illumination * 100)}% lit, and the phase is ${phaseName.toLowerCase()}, which means ${phaseMeaning}.`,
    signChange.time <= dayEnd
      ? `It changes signs at ${formatET(signChange.time)} ET, so the mood really does shift mid-day.`
      : `It stays in ${moon.signName} all day, so the tone stays pretty consistent.`,
  ];

  sections.push(['TODAY AT A GLANCE', ...moonIntro].join('\n'));

  const timingLines = [
    moonTimelineLine('12:00 AM ET', midnight, natalChart),
    ...(signChange.time <= dayEnd ? [moonTimelineLine(`${formatET(signChange.time)} ET`, signChange.time, natalChart)] : []),
    moonTimelineLine('12:00 PM ET', noon, natalChart),
    moonTimelineLine('11:59 PM ET', end, natalChart),
    exactPhase
      ? `${exactPhase.type} is exact today at ${formatET(exactPhase.time)} ET.`
      : nearestMajor
        ? `Nearest major phase: ${nearestMajor.type} at ${formatET(nearestMajor.date)} ET ${nearestMajor.date < midnight ? 'already passed' : 'coming up'}.`
        : '',
    voc.isCurrentlyVOC && voc.end
      ? `Void of course now until ${formatVOCTime(voc.end)} ET.`
      : (voc.isVOC && voc.start && voc.end
          ? `Void of course window: ${formatVOCTime(voc.start)} ET to ${formatVOCTime(voc.end)} ET.`
          : ''),
  ].filter(Boolean);

  sections.push(['MOON TIMING', ...timingLines].join('\n'));

  if (natalChart) {
    const personalTransits = calculateTransitAspects(midnight, planets, natalChart);
    const topTransits = getTopTransitAspects(personalTransits, 2);
    const transitLines = topTransits.map((t) => {
      const felt = getFeltSenseDescription(t.transitPlanet, t.natalPlanet, t.aspect, t.natalHouse, t.transitHouse);
      const personalized = getPersonalizedTransitInterpretation(
        t.transitPlanet,
        t.aspect,
        t.natalPlanet,
        t.natalHouse,
        t.natalSign,
      );
      const header = `${t.transitPlanet} ${ASPECT_GLYPH[t.aspect] || ''} natal ${t.natalPlanet}, ${t.orb}° orb${t.natalHouse ? `, your ${ordinal(t.natalHouse)} house` : ''}`;
      const body = felt?.felt || personalized.howItFeels || t.interpretation;
      return `• ${header}\n  ${body}`;
    });

    const moonHits = personalTransits
      .filter(t => t.transitPlanet === 'Moon')
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
      .slice(0, 3)
      .map(t => `• ☽ ${ASPECT_GLYPH[t.aspect] || ''} natal ${t.natalPlanet}${t.natalHouse ? ` in your ${ordinal(t.natalHouse)}` : ''}, ${t.orb}° orb`);

    sections.push([
      'FOR YOU',
      topTransits.length
        ? transitLines.join('\n')
        : 'No major personal transit is dominating the whole day, so the Moon timing matters more than a slow-planet headline.',
      moonHits.length
        ? `Moon hits to watch:\n${moonHits.join('\n')}`
        : '',
      `What the starting degree means: ${getDegreeMeaning(moon.degree).meaning}`,
    ].filter(Boolean).join('\n'));
  } else {
    sections.push([
      'FOR YOU',
      `What the starting degree means: ${getDegreeMeaning(moon.degree).meaning}`,
      'No natal chart was attached here, so I can only give the collective sky and Moon timing.',
    ].join('\n'));
  }

  sections.push(formatSkyBlockForEmail(date));
  return sections.join('\n\n');
}
