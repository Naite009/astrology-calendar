/**
 * The deeper nakshatra layer: presiding deity, gana (temperament class),
 * yoni (animal nature) and tara bala (the nine-fold count from the birth
 * nakshatra that classical texts use for compatibility and timing).
 *
 * These are the standard classical attributions. Nothing is invented, and
 * nothing here is used to make a prediction on its own.
 */

import { NAKSHATRA_NAMES, NakshatraInfo, VedicPlanet } from './nakshatras';

export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';

export interface NakshatraAttributes {
  name: string;
  deity: string;
  /** What the deity governs, in plain English */
  deityPlain: string;
  gana: Gana;
  ganaPlain: string;
  yoni: string;
  yoniPlain: string;
}

const DEITY: Record<string, [string, string]> = {
  Ashwini: ['Ashwini Kumaras', 'the twin healers who arrive fast, so this mansion carries quick starts and quick repair'],
  Bharani: ['Yama', 'the keeper of limits and endings, so this mansion carries discipline, consequence and knowing when something is finished'],
  Krittika: ['Agni', 'fire, so this mansion carries cutting through, burning off what is not needed and sharp honesty'],
  Rohini: ['Brahma, as Prajapati', 'the creator, so this mansion carries growth, fertility and building something that lasts'],
  Mrigashira: ['Soma', 'the moon nectar, so this mansion carries searching, curiosity and gentle restlessness'],
  Ardra: ['Rudra', 'the storm, so this mansion carries upheaval that clears the air and feeling things intensely'],
  Punarvasu: ['Aditi', 'the boundless mother, so this mansion carries return, renewal and starting again without bitterness'],
  Pushya: ['Brihaspati', 'the teacher, so this mansion carries nourishing others, guidance and steady care'],
  Ashlesha: ['the Nagas', 'the serpents, so this mansion carries penetrating insight, holding on tightly and reading what is unsaid'],
  Magha: ['the Pitris', 'the ancestors, so this mansion carries lineage, inherited position and duty to where you came from'],
  'Purva Phalguni': ['Bhaga', 'delight and good fortune, so this mansion carries enjoyment, romance and rest'],
  'Uttara Phalguni': ['Aryaman', 'patronage and friendship, so this mansion carries contracts, alliances and generosity with structure'],
  Hasta: ['Savitar', 'the skilled sun, so this mansion carries craft, hands, dexterity and making things work'],
  Chitra: ['Vishwakarma', 'the divine architect, so this mansion carries design, brilliance and visible quality'],
  Swati: ['Vayu', 'wind, so this mansion carries independence, movement and needing room to breathe'],
  Vishakha: ['Indra and Agni', 'power and fire together, so this mansion carries ambition, focus and pushing to a goal'],
  Anuradha: ['Mitra', 'friendship and agreement, so this mansion carries loyalty, devotion and working well in groups'],
  Jyeshtha: ['Indra', 'the chief, so this mansion carries seniority, authority and carrying responsibility others avoid'],
  Mula: ['Nirriti', 'dissolution, so this mansion carries getting to the root, tearing out and rebuilding from the bottom'],
  'Purva Ashadha': ['Apas', 'the waters, so this mansion carries conviction, cleansing and refusing to back down'],
  'Uttara Ashadha': ['the Vishwadevas', 'the universal gods, so this mansion carries endurance, lasting victory and slow permanent gains'],
  Shravana: ['Vishnu', 'the preserver, so this mansion carries listening, learning and keeping things together'],
  Dhanishta: ['the Vasus', 'the bright ones, so this mansion carries rhythm, wealth building and performance'],
  Shatabhisha: ['Varuna', 'the cosmic waters and oaths, so this mansion carries healing, boundaries and working at a distance'],
  'Purva Bhadrapada': ['Aja Ekapada', 'the one-footed goat, so this mansion carries intensity, unusual perspective and transformation'],
  'Uttara Bhadrapada': ['Ahir Budhnya', 'the serpent of the deep, so this mansion carries depth, patience and quiet wisdom'],
  Revati: ['Pushan', 'the protector of travelers, so this mansion carries safe passage, kindness and completing a journey'],
};

const GANA: Record<string, Gana> = {};
(['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'])
  .forEach(n => { GANA[n] = 'Deva'; });
(['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada', 'Uttara Bhadrapada'])
  .forEach(n => { GANA[n] = 'Manushya'; });
(['Krittika', 'Ashlesha', 'Magha', 'Chitra', 'Vishakha', 'Jyeshtha', 'Mula', 'Dhanishta', 'Shatabhisha'])
  .forEach(n => { GANA[n] = 'Rakshasa'; });

const GANA_PLAIN: Record<Gana, string> = {
  Deva: 'Deva gana, described as refined and cooperative. It tends to prefer harmony and doing things properly, and can find blunt confrontation draining.',
  Manushya: 'Manushya gana, described as human and mixed. It tends to weigh both sides, works through negotiation, and can get stuck between two options.',
  Rakshasa: 'Rakshasa gana, described as intense and self-directed. It tends to be direct, can handle friction others avoid, and does not soften things for comfort.',
};

const YONI: Record<string, string> = {
  Ashwini: 'horse', Bharani: 'elephant', Krittika: 'sheep', Rohini: 'serpent',
  Mrigashira: 'serpent', Ardra: 'dog', Punarvasu: 'cat', Pushya: 'sheep',
  Ashlesha: 'cat', Magha: 'rat', 'Purva Phalguni': 'rat', 'Uttara Phalguni': 'cow',
  Hasta: 'buffalo', Chitra: 'tiger', Swati: 'buffalo', Vishakha: 'tiger',
  Anuradha: 'deer', Jyeshtha: 'deer', Mula: 'dog', 'Purva Ashadha': 'monkey',
  'Uttara Ashadha': 'mongoose', Shravana: 'monkey', Dhanishta: 'lion',
  Shatabhisha: 'horse', 'Purva Bhadrapada': 'lion', 'Uttara Bhadrapada': 'cow', Revati: 'elephant',
};

const YONI_PLAIN: Record<string, string> = {
  horse: 'restless, wants forward motion, does badly when penned in',
  elephant: 'steady and strong, slow to move but very hard to shift once decided',
  sheep: 'goes along until pushed, then holds its ground unexpectedly',
  serpent: 'watchful and private, senses the room before speaking',
  dog: 'loyal and protective, takes betrayal personally',
  cat: 'independent and self-contained, needs to approach things on its own terms',
  rat: 'quick, resourceful, notices details and gaps others miss',
  cow: 'nurturing and productive, gives a lot and needs safe ground to do it',
  buffalo: 'endures heavy work, keeps going long past the point others stop',
  tiger: 'competitive and decisive, moves in one committed strike',
  deer: 'sensitive and quick to startle, reads atmosphere immediately',
  monkey: 'clever and social, learns by playing and testing',
  mongoose: 'fearless with difficulty, deals with problems others will not touch',
  lion: 'proud and visible, does not do well being overlooked',
};

export function nakshatraAttributes(name: string): NakshatraAttributes | null {
  const deity = DEITY[name];
  const gana = GANA[name];
  const yoni = YONI[name];
  if (!deity || !gana || !yoni) return null;
  return {
    name,
    deity: deity[0],
    deityPlain: deity[1],
    gana,
    ganaPlain: GANA_PLAIN[gana],
    yoni,
    yoniPlain: YONI_PLAIN[yoni] || '',
  };
}

/* ------------------------------------------------------------------ */
/* Tara bala                                                           */
/* ------------------------------------------------------------------ */

export const TARA_NAMES = [
  'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Ati Mitra',
] as const;

export type TaraName = typeof TARA_NAMES[number];

const TARA_PLAIN: Record<TaraName, string> = {
  Janma: 'the birth star itself. Personal, exposed, and better for rest and inner work than for launching something public.',
  Sampat: 'the wealth star. Classically favorable for gain, purchases and building resources.',
  Vipat: 'the danger star. Classically a poor choice for risk, travel or a first move.',
  Kshema: 'the well-being star. Classically favorable for health, comfort and steady progress.',
  Pratyari: 'the obstacle star. Classically a time when opposition and friction show up more.',
  Sadhaka: 'the achievement star. Classically favorable for finishing things and getting agreement.',
  Vadha: 'the difficulty star. Classically the weakest of the nine for starting anything important.',
  Mitra: 'the friend star. Classically favorable for people, alliances and asking for help.',
  'Ati Mitra': 'the best friend star. Classically the most supportive of the nine.',
};

export interface TaraBala {
  index: number;         // 1-9
  name: TaraName;
  quality: 'favorable' | 'mixed' | 'challenging';
  plain: string;
}

const QUALITY: Record<TaraName, TaraBala['quality']> = {
  Janma: 'mixed', Sampat: 'favorable', Vipat: 'challenging', Kshema: 'favorable',
  Pratyari: 'challenging', Sadhaka: 'favorable', Vadha: 'challenging',
  Mitra: 'favorable', 'Ati Mitra': 'favorable',
};

/**
 * Tara bala of a target nakshatra measured from the birth nakshatra.
 * The count runs 1 to 27 and repeats the nine taras three times.
 */
export function taraBala(birthNakshatraIndex: number, targetNakshatraIndex: number): TaraBala {
  const count = ((targetNakshatraIndex - birthNakshatraIndex + 27) % 27) + 1;
  const idx = ((count - 1) % 9) + 1;
  const name = TARA_NAMES[idx - 1];
  return { index: idx, name, quality: QUALITY[name], plain: TARA_PLAIN[name] };
}

/** Full descriptive block for one placement's nakshatra. */
export function nakshatraDepth(info: NakshatraInfo): {
  attributes: NakshatraAttributes | null;
  lord: VedicPlanet;
  padaNote: string;
} {
  const padaNote = `Pada ${info.pada} of 4. Each pada is 3 degrees 20 minutes wide and maps onto one navamsa sign, which is why two people with the same nakshatra can run it very differently.`;
  return { attributes: nakshatraAttributes(info.name), lord: info.lord, padaNote };
}

export { NAKSHATRA_NAMES };
