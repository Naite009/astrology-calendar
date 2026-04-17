import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';
import { formatFutureTransitsContext, scanFutureTransits } from './futureTransitScanner';
import { getPlanetLongitudeExact, normalizeLongitude } from './transitMath';

const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const PLANET_SYMBOLS: Record<string, string> = {
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const TRANSIT_BODIES: Record<string, Astronomy.Body> = {
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: 'Pluto' as Astronomy.Body,
};

const NATAL_THEME_MAP: Record<string, string> = {
  Sun: 'how you show up in the relationship — your confidence, ego, and sense of being seen by your partner',
  Moon: 'your emotional safety, what you need to feel held, and how you behave at home with the person closest to you',
  Mercury: 'the way you talk, listen, and make decisions with a partner — the conversations you keep replaying',
  Venus: 'attraction, closeness, affection, what you value in love, and how easy it is to receive it',
  Mars: 'desire, sex, conflict, and how directly you go after — or argue for — what you want from someone',
};

const TRANSIT_ACTION_MAP: Record<string, string> = {
  Jupiter: 'expands the relationship — more opportunity, more confidence, sometimes meeting someone new or going to the next level',
  Saturn: 'gets serious — something has to be defined, committed to, or honestly admitted; lukewarm dynamics get tested',
  Uranus: 'shakes the relationship loose — sudden attraction, sudden distance, or a sharp need for more space and freedom',
  Neptune: 'blurs the picture — fantasy, idealization, longing, or confusion about what the connection actually is',
  Pluto: 'turns the heat up underneath — power dynamics, intensity, jealousy, or a deep transformation in how you relate',
};

const ASPECT_TONE_MAP: Record<string, string> = {
  conjunction: 'A direct activation — the theme is right on top of you and hard to ignore',
  sextile: 'A helpful opening — things flow if you make a move, but it will not force itself',
  square: 'A pressure point — friction, frustration, or an old pattern coming up to be changed',
  trine: 'A smoother window — the energy is supportive and easier to receive than usual',
  opposition: 'A mirror — the dynamic shows up through another person and asks for a turning point',
};

const TAG_ACTION_MAP: Record<string, { label: string; watch: string }> = {
  meeting: {
    label: 'Meeting energy',
    watch: 'Say yes to invitations, introductions, and one-off events you would normally skip — this is when new people enter through unexpected doors.',
  },
  attraction: {
    label: 'Attraction spike',
    watch: 'Chemistry feels louder than usual. Notice who you keep thinking about, but wait two weeks before deciding if it is real connection or just heat.',
  },
  commitment: {
    label: 'Define-the-relationship',
    watch: 'This is the window for the honest conversation — what are we, where is this going, what do I actually need? Lukewarm answers are an answer.',
  },
  test: {
    label: 'Pressure test',
    watch: 'Old patterns and unspoken doubts surface. Do not make permanent decisions in the heat of it — let it show you what is actually true, then act.',
  },
  rupture: {
    label: 'Sudden shift',
    watch: 'Something changes faster than you expected — a person leaves, a feeling flips, a need for space gets loud. Resist the urge to force it back.',
  },
  healing: {
    label: 'Repair window',
    watch: 'A softer opening to repair, forgive, or be vulnerable. Reach out to the person you have been avoiding the conversation with.',
  },
};

export interface DeterministicTimingTransit {
  planet: string;
  symbol: string;
  position: string;
  aspect: string;
  exact_degree: string;
  natal_point: string;
  first_applying_date: string;
  exact_hit_date: string;
  separating_end_date: string;
  pass_label: string;
  date_range: string;
  tag: 'meeting' | 'attraction' | 'commitment' | 'test' | 'rupture' | 'healing';
  interpretation: string;
}

export interface DeterministicTimingWindow {
  label: string;
  description: string;
}

export interface DeterministicTimingSection {
  type: 'timing_section';
  title: string;
  transits: DeterministicTimingTransit[];
  windows: DeterministicTimingWindow[];
}

interface FutureTimingData {
  context: string;
  section: DeterministicTimingSection | null;
}

const clampDegreeParts = (lon: number) => {
  const normalized = normalizeLongitude(lon);
  let signIdx = Math.floor(normalized / 30);
  const signStart = signIdx * 30;
  const degreeWithFraction = normalized - signStart;
  let wholeDegrees = Math.floor(degreeWithFraction);
  let minutes = Math.round((degreeWithFraction - wholeDegrees) * 60);

  if (minutes === 60) {
    wholeDegrees += 1;
    minutes = 0;
  }

  if (wholeDegrees === 30) {
    wholeDegrees = 0;
    signIdx = (signIdx + 1) % 12;
  }

  return {
    sign: ZODIAC[signIdx],
    wholeDegrees,
    minutes,
  };
};

const longitudeToSignDegree = (lon: number): string => {
  const { sign, wholeDegrees, minutes } = clampDegreeParts(lon);
  return `${wholeDegrees}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

const buildNatalPositions = (chart: NatalChart | null): { name: string; longitude: number }[] => {
  if (!chart?.planets) return [];

  return Object.entries(chart.planets).flatMap(([name, data]) => {
    if (!data || typeof data !== 'object' || !('sign' in data)) return [];
    const sign = (data as { sign: string }).sign;
    const signIdx = ZODIAC.indexOf(sign);
    if (signIdx < 0) return [];

    const degree = typeof (data as { degree?: number }).degree === 'number' ? (data as { degree: number }).degree : 0;
    const minutes = typeof (data as { minutes?: number }).minutes === 'number' ? (data as { minutes: number }).minutes : 0;

    return [{ name, longitude: signIdx * 30 + degree + minutes / 60 }];
  });
};

const isRetrogradeAtExactHit = (planet: string, exactDate: Date, passLabel: string): boolean => {
  if (/retrograde/i.test(passLabel)) return true;

  const body = TRANSIT_BODIES[planet];
  if (!body) return false;

  const before = getPlanetLongitudeExact(body, new Date(exactDate.getTime() - 12 * 60 * 60 * 1000));
  const after = getPlanetLongitudeExact(body, new Date(exactDate.getTime() + 12 * 60 * 60 * 1000));
  return normalizeLongitude(after - before + 360) > 180;
};

const classifyTimingTag = (
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
): DeterministicTimingTransit['tag'] => {
  const supportiveAspect = ['conjunction', 'sextile', 'trine'].includes(aspect);

  if (transitPlanet === 'Jupiter') {
    if (['Venus', 'Mars'].includes(natalPlanet)) return 'attraction';
    if (natalPlanet === 'Moon') return 'healing';
    return 'meeting';
  }

  if (transitPlanet === 'Saturn') {
    return supportiveAspect ? 'commitment' : 'test';
  }

  if (transitPlanet === 'Uranus') {
    return supportiveAspect ? 'meeting' : 'rupture';
  }

  if (transitPlanet === 'Neptune') {
    return supportiveAspect ? 'healing' : 'test';
  }

  if (transitPlanet === 'Pluto') {
    return supportiveAspect ? 'healing' : 'test';
  }

  return 'test';
};

const buildTransitInterpretation = (params: {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalDegree: string;
  exactDate: string;
  dateRange: string;
  passLabel: string;
  isRetrograde: boolean;
}): string => {
  const {
    transitPlanet,
    aspect,
    natalPlanet,
    natalDegree,
    exactDate,
    dateRange,
    passLabel,
    isRetrograde,
  } = params;

  const aspectTone = ASPECT_TONE_MAP[aspect] ?? 'This is an important activation';
  const transitAction = TRANSIT_ACTION_MAP[transitPlanet] ?? 'activates';
  const natalTheme = NATAL_THEME_MAP[natalPlanet] ?? 'a major part of your personal pattern';

  const passSentence =
    passLabel === 'single pass'
      ? `The story peaks on ${exactDate} and the full felt-sense window runs ${dateRange} — meaning the theme builds, peaks, then settles inside that range.`
      : `${passLabel} — this is part of a longer multi-pass cycle, so the same theme will revisit. This pass peaks on ${exactDate} inside ${dateRange}.`;

  const retrogradeSentence = isRetrograde
    ? `Because ${transitPlanet} is retrograde on this hit, the situation tends to revisit, get reconsidered, or pull you back in instead of moving in one clean direction.`
    : '';

  return `${aspectTone}. In your relationship world, ${transitPlanet} ${transitAction} around ${natalTheme}. ${passSentence}${retrogradeSentence ? ` ${retrogradeSentence}` : ''}`;
};

const buildTimingWindowDescription = (window: {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalDegree: string;
  exactDates: { date: string; label: string }[];
}): string => {
  const exactSummary = window.exactDates
    .map((exact) => `${exact.date}${exact.label !== 'single pass' ? ` (${exact.label})` : ''}`)
    .join('; ');

  const aspectTone = ASPECT_TONE_MAP[window.aspect] ?? 'An important activation';
  const transitAction = TRANSIT_ACTION_MAP[window.transitPlanet] ?? 'activates';
  const natalTheme = NATAL_THEME_MAP[window.natalPlanet] ?? 'a major part of your personal pattern';

  return `${aspectTone}. ${window.transitPlanet} ${transitAction} around ${natalTheme}. Peaks: ${exactSummary}.`;
};

export const getTimingTagDetails = (tag: string) => {
  return TAG_ACTION_MAP[tag] ?? { label: tag, watch: '' };
};


export function buildDeterministicTimingData(
  chart: NatalChart | null,
  monthsAhead: number = 18,
  maxTransits: number = 15,
): FutureTimingData {
  const natalPositions = buildNatalPositions(chart);
  if (natalPositions.length === 0) {
    return { context: '', section: null };
  }

  const windows = scanFutureTransits(natalPositions, monthsAhead);
  if (windows.length === 0) {
    return { context: '', section: null };
  }

  const transits: DeterministicTimingTransit[] = [];
  const includedWindows: typeof windows = [];

  for (const window of windows) {
    if (!Array.isArray(window.exactDates) || window.exactDates.length === 0) continue;

    const windowTransits = window.exactDates.map((exact) => {
      const exactDate = new Date(exact.date);
      const exactLongitude = Number.isNaN(exactDate.getTime())
        ? null
        : getPlanetLongitudeExact(TRANSIT_BODIES[window.transitPlanet], exactDate);
      const exactDegree = exactLongitude === null ? window.natalDegree : longitudeToSignDegree(exactLongitude);
      const retrograde = Number.isNaN(exactDate.getTime())
        ? /retrograde/i.test(exact.label) || window.isRetrograde
        : isRetrogradeAtExactHit(window.transitPlanet, exactDate, exact.label);
      const exactDegreeLabel = retrograde ? `${exactDegree} (R)` : exactDegree;
      const natalPoint = `${window.natalPlanet} at ${window.natalDegree}`;
      const passSuffix = exact.label === 'single pass' ? '' : ` (${exact.label})`;

      return {
        planet: window.transitPlanet,
        symbol: PLANET_SYMBOLS[window.transitPlanet] ?? '',
        position: `${window.transitPlanet} at ${exactDegreeLabel} ${window.aspect} natal ${natalPoint}${passSuffix}`,
        aspect: window.aspect,
        exact_degree: exactDegreeLabel,
        natal_point: natalPoint,
        first_applying_date: window.enterDate,
        exact_hit_date: exact.date,
        separating_end_date: window.exitDate,
        pass_label: exact.label,
        date_range: window.dateRange,
        tag: classifyTimingTag(window.transitPlanet, window.aspect, window.natalPlanet),
        interpretation: buildTransitInterpretation({
          transitPlanet: window.transitPlanet,
          aspect: window.aspect,
          natalPlanet: window.natalPlanet,
          natalDegree: window.natalDegree,
          exactDate: exact.date,
          dateRange: window.dateRange,
          passLabel: exact.label,
          isRetrograde: retrograde,
        }),
      } satisfies DeterministicTimingTransit;
    });

    if (windowTransits.length === 0) continue;

    includedWindows.push(window);
    transits.push(...windowTransits);

    if (transits.length >= maxTransits) {
      break;
    }
  }

  const limitedTransits = transits.slice(0, maxTransits);
  if (limitedTransits.length === 0) {
    return {
      context: formatFutureTransitsContext(windows),
      section: null,
    };
  }

  return {
    context: formatFutureTransitsContext(windows),
    section: {
      type: 'timing_section',
      title: 'Timing Windows',
      transits: limitedTransits,
      windows: includedWindows.map((window) => ({
        label: window.dateRange,
        description: buildTimingWindowDescription(window),
      })),
    },
  };
}

export function mergeDeterministicTimingSection(data: any, timingSection: DeterministicTimingSection | null) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.sections) || !timingSection) {
    return data;
  }

  const timingIndex = data.sections.findIndex((section: { type?: string }) => section?.type === 'timing_section');

  if (timingIndex >= 0) {
    data.sections[timingIndex] = {
      ...data.sections[timingIndex],
      title: data.sections[timingIndex].title || timingSection.title,
      transits: timingSection.transits,
      windows: timingSection.windows,
    };
    return data;
  }

  const summaryIndex = data.sections.findIndex((section: { type?: string }) => section?.type === 'summary_box');
  if (summaryIndex >= 0) {
    data.sections.splice(summaryIndex, 0, timingSection);
    return data;
  }

  data.sections.push(timingSection);
  return data;
}