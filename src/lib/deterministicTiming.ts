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

export type TimingReadingType = 'relationship' | 'relocation' | 'general';

const NATAL_THEME_MAP: Record<string, string> = {
  Sun: 'how you show up in the relationship — your confidence, ego, and sense of being seen by your partner',
  Moon: 'your emotional safety, what you need to feel held, and how you behave at home with the person closest to you',
  Mercury: 'the way you talk, listen, and make decisions with a partner — the conversations you keep replaying',
  Venus: 'attraction, closeness, affection, what you value in love, and how easy it is to receive it',
  Mars: 'desire, sex, conflict, and how directly you go after — or argue for — what you want from someone',
};

const NATAL_THEME_MAP_RELOCATION: Record<string, string> = {
  Sun: 'your visibility, identity, and sense of purpose in a new city',
  Moon: 'your sense of home, belonging, and what makes a place feel emotionally safe and settled',
  Mercury: 'communication, community, and mental stimulation in your daily environment',
  Venus: 'the aesthetic, social, and lifestyle quality of your environment',
  Mars: 'your energy, drive, and how much effort daily life in a new place requires',
  Jupiter: 'expansion, opportunity, and whether a place opens doors or closes them',
  Saturn: 'commitment, structure, and what you are willing to build in a new place',
};

const NATAL_THEME_MAP_GENERAL: Record<string, string> = {
  Sun: 'your identity, vitality, and sense of purpose',
  Moon: 'your emotional needs, inner life, and what makes you feel safe',
  Mercury: 'how you think, communicate, and process information',
  Venus: 'what you value, how you connect, and what brings you pleasure',
  Mars: 'your drive, desire, and how you go after what you want',
  Jupiter: 'where you grow, expand, and find opportunity',
  Saturn: 'where you commit, build structure, and face responsibility',
};

const getNatalThemeMap = (readingType: TimingReadingType): Record<string, string> => {
  if (readingType === 'relocation') return NATAL_THEME_MAP_RELOCATION;
  if (readingType === 'general') return NATAL_THEME_MAP_GENERAL;
  return NATAL_THEME_MAP;
};

const getContextPhrase = (readingType: TimingReadingType): string => {
  if (readingType === 'relocation') return 'In terms of your environment and direction,';
  if (readingType === 'general') return 'In your life right now,';
  return 'In your relationship world,';
};

const TRANSIT_ACTION_MAP: Record<string, string> = {
  Jupiter: 'expands the relationship — more opportunity, more confidence, sometimes meeting someone new or going to the next level',
  Saturn: 'gets serious — something has to be defined, committed to, or honestly admitted; lukewarm dynamics get tested',
  Uranus: 'shakes the relationship loose — sudden attraction, sudden distance, or a sharp need for more space and freedom',
  Neptune: 'blurs the picture — fantasy, idealization, longing, or confusion about what the connection actually is',
  Pluto: 'turns the heat up underneath — power dynamics, intensity, jealousy, or a deep transformation in how you relate',
};

const buildSpecificOpener = (
  transitPlanet: string,
  aspect: string,
  natalPlanet: string
): string => {
  const key = `${transitPlanet}_${aspect}_${natalPlanet}`;
  const openers: Record<string, string> = {
    // Saturn transits
    'Saturn_conjunction_Sun': 'Saturn is sitting directly on your Sun right now — this is a year that asks you to get honest about who you actually are in relationships, not who you perform yourself to be',
    'Saturn_conjunction_Moon': 'Saturn conjuncting your Moon means emotional safety is being tested — situations will arise that ask whether you are choosing partners from genuine readiness or from fear of being alone',
    'Saturn_conjunction_Venus': 'Saturn on your Venus slows love down on purpose — this is not a window for casual, and anything that starts now will carry real weight',
    'Saturn_conjunction_Mars': 'Saturn conjuncting your Mars puts friction on desire — what you want and what you can actually have may not align yet, and the lesson is patience over force',
    'Saturn_square_Sun': 'Saturn squaring your Sun creates pressure around how you show up — in relationships, this often surfaces the gap between who you want to be seen as and who you actually are',
    'Saturn_square_Moon': 'Saturn squaring your Moon means your emotional self-protection is being tested directly — the question is whether the caution that has kept you safe is now the thing keeping you from what you want',
    'Saturn_square_Venus': 'Saturn squaring your Venus is a reality check on what you value — connections that lack real substance will feel that lack more acutely now',
    'Saturn_opposition_Moon': 'Saturn opposing your Moon brings a relationship reality check — something about how you have been handling emotional closeness is asking to be examined honestly',
    // Jupiter transits
    'Jupiter_conjunction_Sun': 'Jupiter on your Sun opens a window of confidence and visibility — in love, this is when you are most likely to attract someone who sees you clearly and responds to who you actually are',
    'Jupiter_conjunction_Moon': 'Jupiter conjuncting your Moon softens emotional guardedness — you may find it genuinely easier than usual to let someone in, and that openness is worth acting on',
    'Jupiter_conjunction_Venus': 'Jupiter on your Venus is the warmest romantic window of the year — chemistry feels louder, new people are more likely to arrive, and existing connections have room to deepen',
    'Jupiter_conjunction_Mars': 'Jupiter conjuncting your Mars amplifies desire and confidence — you are more likely to pursue what you want and more likely to get a genuine response',
    'Jupiter_trine_Sun': 'Jupiter trining your Sun creates a natural ease around how you present yourself — in relationships, you come across more openly and attract people who respond to your real self',
    'Jupiter_trine_Moon': 'Jupiter trining your Moon is a genuinely warm emotional window — connection feels less effortful than usual, and this is a good time to reach toward something you have been holding back from',
    'Jupiter_trine_Venus': 'Jupiter trining your Venus opens the most natural romantic window of this period — attraction is more available, social ease is higher, and new people are more likely to arrive through ordinary life',
    'Jupiter_trine_Mars': 'Jupiter trining your Mars gives desire real momentum — if you have been hesitating about something or someone, this window supports moving toward it',
    'Jupiter_sextile_Sun': 'Jupiter sextiling your Sun creates an opening for confidence in how you show up — say yes to invitations and introductions you would normally skip',
    'Jupiter_sextile_Moon': 'Jupiter sextiling your Moon offers a moment of emotional warmth and openness — a softer window to repair something, reach out, or let someone closer than usual',
    'Jupiter_sextile_Venus': 'Jupiter sextiling your Venus is the clearest opening for new connection in this window — the energy supports warmth, attraction, and social ease if you make a move',
    'Jupiter_sextile_Mars': 'Jupiter sextiling your Mars gives a helpful push to desire — if you have been uncertain about pursuing something, this is a window where the risk is lower and the momentum is real',
    'Jupiter_sextile_Mercury': 'Jupiter sextiling your Mercury opens social doors through conversation — new people are more likely to enter through unexpected introductions or exchanges',
    'Jupiter_square_Sun': 'Jupiter squaring your Sun creates pressure around identity and confidence — in love, this can feel like being pushed to show up more fully than feels comfortable',
    'Jupiter_square_Venus': 'Jupiter squaring your Venus amplifies attraction and optimism together — the risk is that chemistry outpaces compatibility, so let two weeks pass before deciding what something means',
    'Jupiter_square_Mars': 'Jupiter squaring your Mars makes desire loud and impatient — attraction can feel urgent and real, but the square asks you to check whether what you want is actually available',
    'Jupiter_square_Mercury': 'Jupiter squaring your Mercury opens unexpected doors through conversation and connection — say yes to introductions you would normally decline',
    // Neptune transits
    'Neptune_conjunction_Moon': 'Neptune on your Moon softens the boundary between what you feel and what is actually there — this is a period where emotional clarity is genuinely harder to find, and idealization is a real risk',
    'Neptune_conjunction_Venus': 'Neptune conjuncting your Venus is beautiful and blurring at the same time — connections that arrive now can feel fated or soulmate-level, but require careful reality-checking over time',
    'Neptune_opposition_Moon': 'Neptune opposing your Moon means your emotional read on relationships is softer and less reliable than usual — do not make permanent decisions at the peak of this transit',
    'Neptune_square_Moon': 'Neptune squaring your Moon means the clarity you normally rely on to assess people is running softer than usual — you may feel certain about someone before you actually know them well enough to be certain',
    'Neptune_square_Venus': 'Neptune squaring your Venus blurs what you want and who you are drawn to — this is a window for idealization, and what feels like the right person may need more time to reveal itself clearly',
    'Neptune_sextile_Mars': 'Neptune sextiling your Mars softens how desire works — you may feel drawn toward someone in a searching, intuitive way rather than with clear intention, which can be genuinely opening if you stay grounded',
    // Pluto transits
    'Pluto_conjunction_Moon': 'Pluto conjuncting your Moon is a slow and deep transformation of your emotional world — how you handle closeness, vulnerability, and what you need from a relationship is being fundamentally reorganized',
    'Pluto_conjunction_Venus': 'Pluto on your Venus intensifies everything about attraction and love — connections that arrive now are not casual, and this period can produce either deep transformation or obsessive dynamics depending on awareness',
    'Pluto_trine_Moon': 'Pluto trining your Moon is a quieter but powerful invitation to emotional depth — this window supports genuine intimacy, real vulnerability, and conversations that actually change something',
    'Pluto_trine_Venus': 'Pluto trining your Venus deepens what is possible in love — this is not a dramatic transit but a slow one, and the relationships that develop or deepen now have real staying power',
    'Pluto_trine_Mars': 'Pluto trining your Mars is gradually loosening old patterns around desire and pursuit — you may find yourself more willing to act on what you want, more direct than usual, and more aware of what you have been keeping private',
    'Pluto_square_Venus': 'Pluto squaring your Venus surfaces power dynamics in love — attractions now can feel consuming or transformative, and the work is staying conscious of the difference between depth and intensity',
    // Uranus transits
    'Uranus_conjunction_Venus': 'Uranus on your Venus is the most electrically charged transit for your love life in years — something changes faster than expected, a person arrives unexpectedly, or a need for freedom suddenly becomes impossible to ignore',
    'Uranus_conjunction_Mars': 'Uranus conjuncting your Mars shakes loose old patterns around desire and pursuit — sudden attraction, a sharp need for space, or a relationship dynamic that shifts without warning',
    'Uranus_opposition_Venus': 'Uranus opposing your Venus means something in your relationship world is shifting whether you are ready or not — resist forcing anything back to how it was',
    'Uranus_trine_Moon': 'Uranus trining your Moon brings welcome change to your emotional world — something new arrives through unexpected doors, and this is a window where saying yes to unfamiliar invitations actually leads somewhere',
    'Uranus_trine_Venus': 'Uranus trining your Venus opens surprising romantic possibilities — something arrives through an unexpected route, and the attraction that shows up now has a quality of genuine aliveness to it',
    'Uranus_square_Venus': 'Uranus squaring your Venus is disrupting what you thought you wanted in love — this can feel unsettling but it is also clarifying, showing you what you have outgrown',
  };

  // Fall back to a planet-specific opener if exact key not found
  const planetFallbacks: Record<string, Record<string, string>> = {
    Saturn: {
      conjunction: 'Saturn is sitting directly on your natal point — something has to be defined, committed to, or honestly faced',
      square: 'Saturn is squaring your natal point — a reality check is active, and lukewarm situations will feel the pressure',
      opposition: 'Saturn is opposing your natal point — a relationship reality check is asking you to see something clearly',
      trine: 'Saturn trining your natal point offers a chance to build something real — the structure is available if you do the work',
      sextile: 'Saturn sextiling your natal point creates a useful opening for commitment and clarity',
    },
    Jupiter: {
      conjunction: 'Jupiter is expanding this part of your chart directly — opportunity and openness are higher than usual',
      trine: 'Jupiter trining this part of your chart creates a natural opening — warmth and forward movement are available',
      sextile: 'Jupiter sextiling this part of your chart offers a helpful opening — things flow if you make a move',
      square: 'Jupiter squaring this part of your chart amplifies energy and appetite — the risk is overreaching or overcommitting',
      opposition: 'Jupiter opposing this part of your chart brings expansion through relationship — someone else may be the catalyst',
    },
    Neptune: {
      conjunction: 'Neptune is dissolving boundaries around this part of your chart — clarity is harder to find, and openness and idealization are both more available',
      square: 'Neptune squaring this part of your chart means your usual read on this area of life is softer than normal — go slowly',
      opposition: 'Neptune opposing this part of your chart blurs what feels certain — do not make permanent decisions at the peak',
      trine: 'Neptune trining this part of your chart softens defenses in a genuinely opening way — emotional porousness can be healing here',
      sextile: 'Neptune sextiling this part of your chart adds an intuitive, feeling-led quality to this area of life',
    },
    Pluto: {
      conjunction: 'Pluto is sitting on this part of your chart — a slow and deep transformation is underway that will not be rushed',
      trine: 'Pluto trining this part of your chart is a quiet but powerful invitation to go deeper — transformation is available without force',
      square: 'Pluto squaring this part of your chart brings intensity and power dynamics to the surface — awareness is the work',
      opposition: 'Pluto opposing this part of your chart surfaces what has been underneath — power dynamics and depth are unavoidable now',
      sextile: 'Pluto sextiling this part of your chart gives quiet momentum to real change',
    },
    Uranus: {
      conjunction: 'Uranus is sitting directly on this part of your chart — sudden shifts, unexpected arrivals, and the need for freedom are all active',
      trine: 'Uranus trining this part of your chart opens surprising possibilities — something new arrives through an unexpected route',
      square: 'Uranus squaring this part of your chart is disrupting the old pattern — what you thought you wanted may be shifting',
      opposition: 'Uranus opposing this part of your chart means change is coming through relationship — resist forcing the old shape back',
      sextile: 'Uranus sextiling this part of your chart brings a helpful dose of the unexpected — be open to arrivals that don\'t fit the usual pattern',
    },
  };

  if (openers[key]) return openers[key];
  if (planetFallbacks[transitPlanet]?.[aspect]) return planetFallbacks[transitPlanet][aspect];
  return `${transitPlanet} is activating this part of your chart`;
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
  readingType: TimingReadingType;
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
    readingType,
  } = params;

  const aspectTone = buildSpecificOpener(transitPlanet, aspect, natalPlanet);
  const transitAction = TRANSIT_ACTION_MAP[transitPlanet] ?? 'activates';
  const themeMap = getNatalThemeMap(readingType);
  const natalTheme = themeMap[natalPlanet] ?? 'a major part of your personal pattern';
  const contextPhrase = getContextPhrase(readingType);

  const passSentence =
    passLabel === 'single pass'
      ? `The story peaks on ${exactDate} and the full felt-sense window runs ${dateRange} — meaning the theme builds, peaks, then settles inside that range.`
      : `${passLabel} — this is part of a longer multi-pass cycle, so the same theme will revisit. This pass peaks on ${exactDate} inside ${dateRange}.`;

  const retrogradeSentence = isRetrograde
    ? `Because ${transitPlanet} is retrograde on this hit, the situation tends to revisit, get reconsidered, or pull you back in instead of moving in one clean direction.`
    : '';

  return `${aspectTone}. ${contextPhrase} ${transitPlanet} ${transitAction} around ${natalTheme}. ${passSentence}${retrogradeSentence ? ` ${retrogradeSentence}` : ''}`;
};

const buildTimingWindowDescription = (window: {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalDegree: string;
  exactDates: { date: string; label: string }[];
}, readingType: TimingReadingType): string => {
  const exactSummary = window.exactDates
    .map((exact) => `${exact.date}${exact.label !== 'single pass' ? ` (${exact.label})` : ''}`)
    .join('; ');

  const aspectTone = buildSpecificOpener(window.transitPlanet, window.aspect, window.natalPlanet);
  const transitAction = TRANSIT_ACTION_MAP[window.transitPlanet] ?? 'activates';
  const themeMap = getNatalThemeMap(readingType);
  const natalTheme = themeMap[window.natalPlanet] ?? 'a major part of your personal pattern';

  return `${aspectTone}. ${window.transitPlanet} ${transitAction} around ${natalTheme}. Peaks: ${exactSummary}.`;
};

export const getTimingTagDetails = (tag: string) => {
  return TAG_ACTION_MAP[tag] ?? { label: tag, watch: '' };
};


export function buildDeterministicTimingData(
  chart: NatalChart | null,
  monthsAhead: number = 18,
  maxTransits: number = 15,
  readingType: TimingReadingType = 'relationship',
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
          readingType,
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
        description: buildTimingWindowDescription(window, readingType),
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