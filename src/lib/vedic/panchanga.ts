/**
 * Panchanga, the five limbs of the Vedic day: tithi (lunar day), vara
 * (weekday), nakshatra, nitya yoga and karana.
 *
 * Used two ways in this app: as the birth panchanga, which is the traditional
 * first thing a Jyotishi looks at, and as the panchanga of today for the
 * timing sections. All values are computed from the sidereal longitudes and
 * are deterministic.
 */

import { VedicPlanet, getNakshatra, NakshatraInfo } from './nakshatras';

export interface Panchanga {
  tithi: { index: number; name: string; paksha: 'Shukla' | 'Krishna'; fraction: number; plain: string };
  vara: { name: string; lord: VedicPlanet; plain: string };
  nakshatra: NakshatraInfo;
  yoga: { index: number; name: string; plain: string };
  karana: { index: number; name: string; plain: string };
}

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
  'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma',
  'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];

const YOGA_PLAIN: Record<string, string> = {
  Priti: 'affection and easy relations', Ayushman: 'vitality and staying power',
  Saubhagya: 'good fortune and comfort', Shobhana: 'beauty and appeal',
  Sukarma: 'good work and right action', Dhriti: 'steadiness and endurance',
  Vriddhi: 'growth and increase', Dhruva: 'fixity and things that hold',
  Harshana: 'delight and enthusiasm', Siddhi: 'accomplishment',
  Variyana: 'comfort and ease', Shiva: 'benevolence and grace',
  Siddha: 'things completing', Sadhya: 'goals being reachable',
  Shubha: 'auspicious conditions', Shukla: 'brightness and clarity',
  Brahma: 'creative authority', Indra: 'leadership and command',
  Vishkambha: 'obstruction that has to be worked through',
  Atiganda: 'difficulty and needing care', Shula: 'sharpness and friction',
  Ganda: 'knots and complication', Vyaghata: 'clashing and interruption',
  Vajra: 'hardness, unyielding conditions', Vyatipata: 'reversal and upset',
  Parigha: 'blockage and delay', Vaidhriti: 'pulling in two directions',
};

const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
const KARANA_FIXED_START = 'Kimstughna';
const KARANA_FIXED_END = ['Shakuni', 'Chatushpada', 'Naga'];

const KARANA_PLAIN: Record<string, string> = {
  Bava: 'good for beginnings', Balava: 'good for steady ordinary work',
  Kaulava: 'good for people and agreements', Taitila: 'good for anything needing goodwill',
  Gara: 'good for planting, building and food', Vanija: 'good for trade and exchange',
  Vishti: 'classically avoided for new starts, better for finishing and clearing',
  Kimstughna: 'good for routine and religious acts', Shakuni: 'better for repair than for launching',
  Chatushpada: 'connected with animals and land', Naga: 'better for endings than beginnings',
};

const VARA: { name: string; lord: VedicPlanet; plain: string }[] = [
  { name: 'Sunday', lord: 'Sun', plain: 'a Sun day, associated with authority, visibility and self-direction' },
  { name: 'Monday', lord: 'Moon', plain: 'a Moon day, associated with feeling, care and the domestic side of life' },
  { name: 'Tuesday', lord: 'Mars', plain: 'a Mars day, associated with drive, courage and dealing with conflict' },
  { name: 'Wednesday', lord: 'Mercury', plain: 'a Mercury day, associated with talking, learning, trade and detail' },
  { name: 'Thursday', lord: 'Jupiter', plain: 'a Jupiter day, associated with teaching, ethics, expansion and advice' },
  { name: 'Friday', lord: 'Venus', plain: 'a Venus day, associated with relating, beauty, money and pleasure' },
  { name: 'Saturday', lord: 'Saturn', plain: 'a Saturn day, associated with structure, endurance and long obligations' },
];

function norm360(v: number): number { return ((v % 360) + 360) % 360; }

/**
 * @param sunLon sidereal longitude of the Sun
 * @param moonLon sidereal longitude of the Moon
 * @param date the moment, used only for the weekday
 */
export function buildPanchanga(sunLon: number, moonLon: number, date: Date): Panchanga {
  const elong = norm360(moonLon - sunLon);

  // Tithi: 30 lunar days of 12 degrees each.
  const tithiRaw = elong / 12;
  const tithiIdx = Math.floor(tithiRaw) + 1;          // 1-30
  const fraction = tithiRaw - Math.floor(tithiRaw);
  const paksha: 'Shukla' | 'Krishna' = tithiIdx <= 15 ? 'Shukla' : 'Krishna';
  const within = tithiIdx <= 15 ? tithiIdx : tithiIdx - 15;
  const tithiName = within === 15
    ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya')
    : TITHI_NAMES[within - 1];

  const pakshaPlain = paksha === 'Shukla'
    ? 'the waxing half, when the Moon is filling. Classically the building half of the month.'
    : 'the waning half, when the Moon is emptying. Classically the releasing and completing half of the month.';

  // Nitya yoga: sum of the two longitudes divided into 27 parts.
  const yogaIdx = Math.floor(norm360(sunLon + moonLon) / (360 / 27));
  const yogaName = YOGA_NAMES[yogaIdx];

  // Karana: half-tithis, 60 per lunar month, cycling seven movable names.
  const karanaIdx = Math.floor(elong / 6) + 1;         // 1-60
  let karanaName: string;
  if (karanaIdx === 1) karanaName = KARANA_FIXED_START;
  else if (karanaIdx >= 58) karanaName = KARANA_FIXED_END[karanaIdx - 58];
  else karanaName = KARANA_MOVABLE[(karanaIdx - 2) % 7];

  const vara = VARA[date.getDay()];

  return {
    tithi: {
      index: tithiIdx,
      name: tithiName,
      paksha,
      fraction,
      plain: `${tithiName} of the ${paksha} paksha, ${pakshaPlain}`,
    },
    vara: { ...vara, plain: `${vara.name}, ${vara.plain}.` },
    nakshatra: getNakshatra(moonLon),
    yoga: {
      index: yogaIdx + 1,
      name: yogaName,
      plain: `${yogaName} yoga, associated with ${YOGA_PLAIN[yogaName] || 'its own particular quality'}.`,
    },
    karana: {
      index: karanaIdx,
      name: karanaName,
      plain: `${karanaName} karana, ${KARANA_PLAIN[karanaName] || 'with its own traditional use'}.`,
    },
  };
}

export const PANCHANGA_NOTE =
  'The panchanga is the five-part description of a day: the lunar day, the weekday and its ruling graha, the Moon\'s lunar mansion, the nitya yoga and the karana. A Jyotishi normally reads the birth panchanga before anything else, because it sets the quality of the day a person arrived on.';
