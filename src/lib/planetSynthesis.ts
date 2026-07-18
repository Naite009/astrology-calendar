// Chart-specific synthesis for a single planet placement.
// Produces { look, tension, help } — three short sections that read like real advice,
// not generic astrology definitions.
//
// Priority when interpreting:
//   1) Tight aspects under 2°
//   2) House placement
//   3) Sign placement
//   4) Wider aspects only when they shift the picture
//
// Rules enforced:
//   - No em dashes
//   - No "deepest wound", "greatest healing gift", "trust what cannot be proven",
//     "dissolving boundaries", "tell the truth in the room", "this energy invites you to"
//   - Behavior language: how it shows up at work, in relationships, in conflict, in habits
//   - Use "you may", "you can", "you are likely to"
//   - Never call a 3-5° aspect "right on top of" the other planet

import { ChartPlanet, ChartAspect, DignityType } from './chartDecoderLogic';

export interface PlanetSynthesis {
  look: string;
  tension: string;
  help: string;
}

// ---- Short domain phrase per house (behavior, not jargon) ----
const HOUSE_DOMAIN: Record<number, string> = {
  1: 'how you show up in a room and how strangers first read you',
  2: 'money, self-worth, and what you are willing to spend energy on',
  3: 'the way you talk, text, listen, and move through daily conversations',
  4: 'home life, family, privacy, and what you need in order to rest',
  5: 'creative expression, romance, play, and how you take a risk to be seen',
  6: 'work, health, routine, and the small responsibilities that keep life running',
  7: 'close partnerships and one-on-one dynamics with the people you choose',
  8: 'shared money, intimacy, control, and what happens when things get serious',
  9: 'meaning, travel, teaching, and how you decide what you actually believe',
  10: 'career, reputation, and how you handle authority (yours and theirs)',
  11: 'friendships, groups, and the long-range vision you are building toward',
  12: 'the private inner life, sleep, imagination, and what you process behind closed doors',
};

// ---- How each planet tends to act (verbs, not adjectives) ----
const PLANET_VERB: Record<string, string> = {
  Sun: 'define yourself and get recognized',
  Moon: 'feel, react, and settle your nervous system',
  Mercury: 'think, talk, and make yourself understood',
  Venus: 'love, spend, and decide what is worth your time',
  Mars: 'act, push back, and pursue what you want',
  Jupiter: 'expand, take chances, and decide what is enough',
  Saturn: 'commit, build, and hold a boundary',
  Uranus: 'break a pattern and refuse a script you never agreed to',
  Neptune: 'dream, imagine, and merge with something bigger than you',
  Pluto: 'confront power, control, and what refuses to stay buried',
  Chiron: 'notice pain that other people miss',
  NorthNode: 'grow into a version of yourself that does not yet feel natural',
  SouthNode: 'fall back on the thing you already know how to do',
  Lilith: 'refuse to be tamed by rules you did not write',
  Ceres: 'give care and worry about who is being fed',
  Pallas: 'spot the pattern and design a strategy',
  Juno: 'commit and defend what you belong to',
  Vesta: 'devote yourself to the one thing that matters most',
};

// ---- Sign flavor: short manner phrase (not "keywords") ----
const SIGN_STYLE: Record<string, string> = {
  Aries: 'quickly and head-on, with little patience for stalling',
  Taurus: 'slowly, physically, and only after you have decided it is worth it',
  Gemini: 'through words, curiosity, and switching lanes mid-thought',
  Cancer: 'through feeling first and defending the people you love',
  Leo: 'visibly, with warmth, and needing to be seen doing it',
  Virgo: 'carefully, with a running list of what is not yet right',
  Libra: 'through other people, comparing options and weighing fairness',
  Scorpio: 'quietly, intensely, and rarely showing all your cards',
  Sagittarius: 'openly and in motion, chasing meaning and the bigger picture',
  Capricorn: 'seriously, with a plan, measuring yourself against results',
  Aquarius: 'from a step back, testing whether the rule actually makes sense',
  Pisces: 'through mood, imagination, and picking up on the room without being told',
};

// ---- What another planet, as the "other side" of a hard aspect, asks of this planet ----
const HARD_PRESSURE: Record<string, string> = {
  Sun: 'be someone specific instead of blending in',
  Moon: 'protect your comfort and mood',
  Mercury: 'stop, think, and put it into words',
  Venus: 'want what you actually want, not what is polite',
  Mars: 'act now and stop waiting for permission',
  Jupiter: 'want more, promise more, or believe it will work out',
  Saturn: 'slow down, commit, and take responsibility',
  Uranus: 'break the pattern even when it costs you',
  Neptune: 'let go of the hard edges and drift',
  Pluto: 'go deeper, confront control, and refuse to be dismissed',
  Chiron: 'sit with something that still hurts',
  NorthNode: 'grow past your default move',
  SouthNode: 'fall back on the old habit',
  Lilith: 'stop censoring yourself',
  Ceres: 'take care of someone',
  Pallas: 'analyze it before you feel it',
  Juno: 'commit and stay',
  Vesta: 'give it everything and cut out the rest',
};

// ---- What a soft aspect (trine/sextile) tends to add ----
const SOFT_GIFT: Record<string, string> = {
  Sun: 'a natural sense of who you are',
  Moon: 'an easy emotional read on a situation',
  Mercury: 'quick language for what you notice',
  Venus: 'charm and taste that open doors',
  Mars: 'a clean burst of energy when you need it',
  Jupiter: 'lucky timing and the benefit of the doubt',
  Saturn: 'quiet discipline you can lean on',
  Uranus: 'sudden insight that reroutes you',
  Neptune: 'imagination and a soft touch',
  Pluto: 'staying power under pressure',
  Chiron: 'the ability to help people who are hurting',
  NorthNode: 'a pull toward growth that feels doable',
};

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function isHard(t: ChartAspect['aspectType']): boolean {
  return t === 'square' || t === 'opposition' || t === 'conjunction' || t === 'quincunx';
}

function isSoft(t: ChartAspect['aspectType']): boolean {
  return t === 'trine' || t === 'sextile';
}

function aspectVerb(t: ChartAspect['aspectType']): string {
  switch (t) {
    case 'conjunction': return 'fused with';
    case 'opposition': return 'pulling against';
    case 'square': return 'grinding against';
    case 'trine': return 'flowing with';
    case 'sextile': return 'supported by';
    case 'quincunx': return 'awkwardly wired to';
  }
}

function pickDefiningAspect(planetName: string, aspects: ChartAspect[]): ChartAspect | null {
  const mine = aspects.filter(a => a.planet1 === planetName || a.planet2 === planetName);
  if (!mine.length) return null;
  // 1) tightest hard aspect under 2°
  const tightHard = mine
    .filter(a => isHard(a.aspectType) && a.orb < 2)
    .sort((a, b) => a.orb - b.orb)[0];
  if (tightHard) return tightHard;
  // 2) tightest hard aspect under 4°
  const hard = mine
    .filter(a => isHard(a.aspectType) && a.orb < 4)
    .sort((a, b) => a.orb - b.orb)[0];
  if (hard) return hard;
  // 3) tightest of anything under 3°
  const anyTight = mine
    .filter(a => a.orb < 3)
    .sort((a, b) => a.orb - b.orb)[0];
  return anyTight || null;
}

function pickSoftGift(planetName: string, aspects: ChartAspect[]): ChartAspect | null {
  const mine = aspects.filter(a => (a.planet1 === planetName || a.planet2 === planetName) && isSoft(a.aspectType));
  if (!mine.length) return null;
  return mine.sort((a, b) => a.orb - b.orb)[0];
}

function otherOf(a: ChartAspect, self: string): string {
  return a.planet1 === self ? a.planet2 : a.planet1;
}

function orbLabel(orb: number): string {
  if (orb < 1) return 'very tight';
  if (orb < 2) return 'tight';
  if (orb < 4) return 'close';
  return 'wide';
}

// Small planet-name cleanup for prose.
function prose(name: string): string {
  if (name === 'NorthNode') return 'North Node';
  if (name === 'SouthNode') return 'South Node';
  return name;
}

export function synthesizePlanet(
  planet: ChartPlanet,
  aspects: ChartAspect[],
  dignity: DignityType
): PlanetSynthesis {
  const verb = PLANET_VERB[planet.name] || `express ${prose(planet.name)}`;
  const style = SIGN_STYLE[planet.sign] || `in a ${planet.sign} way`;
  const domain = planet.house ? HOUSE_DOMAIN[planet.house] : null;

  // --- LOOK: house-first, sign-second ---
  let look: string;
  if (domain) {
    look = `You are likely to ${verb} inside ${domain}. `;
    look += `In ${planet.sign}, this tends to come out ${style}. `;
    if (dignity === 'detriment' || dignity === 'fall') {
      look += `Because ${prose(planet.name)} is not at home in ${planet.sign}, this side of you usually needs practice before it feels natural.`;
    } else if (dignity === 'rulership' || dignity === 'exaltation') {
      look += `${prose(planet.name)} is strong in ${planet.sign}, so people often notice this in you without you trying.`;
    } else {
      look += `Others may recognize this in you before you fully claim it.`;
    }
  } else {
    look = `You are likely to ${verb} ${style}. `;
    look += `Without a confirmed house, the life area this plays out in is harder to pin down, but the manner is consistent.`;
  }

  // --- TENSION: defining aspect first, then dignity, then retrograde ---
  const defining = pickDefiningAspect(planet.name, aspects);
  let tension: string;
  if (defining) {
    const other = otherOf(defining, planet.name);
    const otherPretty = prose(other);
    const pressure = HARD_PRESSURE[other] || `pull on ${otherPretty}`;
    const closeness = orbLabel(defining.orb);
    if (isHard(defining.aspectType)) {
      tension = `Your ${closeness} ${defining.aspectType} between ${prose(planet.name)} and ${otherPretty} (about ${defining.orb.toFixed(1)}° off exact) means every time you try to ${verb}, something in you also wants to ${pressure}. You may keep swinging between the two instead of holding both.`;
    } else {
      tension = `Your ${closeness} ${defining.aspectType} between ${prose(planet.name)} and ${otherPretty} (about ${defining.orb.toFixed(1)}° off exact) makes this placement easier, but you can miss it unless you use it on purpose.`;
    }
  } else if (dignity === 'detriment' || dignity === 'fall') {
    tension = `The strongest challenge here is that ${prose(planet.name)} in ${planet.sign} does not get natural backup from the sign, so you may hesitate, over-correct, or downplay this side of yourself in front of others.`;
  } else if (planet.retrograde) {
    tension = `${prose(planet.name)} retrograde suggests this works inward first. You can process it privately for a long time before anyone outside sees a decision.`;
  } else {
    tension = `There is no single dominant tension pulling on this placement, which means the pattern here is subtle. It shows up more through repetition than through crisis.`;
  }

  // --- HELP: one concrete, chart-specific sentence ---
  let help: string;
  if (defining && isHard(defining.aspectType)) {
    const other = otherOf(defining, planet.name);
    help = `What helps: stop treating ${prose(planet.name)} and ${prose(other)} as opposites you have to pick between, and build one small daily habit that lets both get a turn.`;
  } else if (defining && isSoft(defining.aspectType)) {
    const other = otherOf(defining, planet.name);
    const gift = SOFT_GIFT[other] || 'a natural advantage here';
    help = `What helps: name this out loud. You have ${gift}, and the gift only pays off when you use it on purpose instead of assuming everyone can do it.`;
  } else if (domain) {
    help = `What helps: pick one recurring situation in ${domain} and practice ${verb} there deliberately, so the placement gets rehearsed instead of only reacted to.`;
  } else {
    help = `What helps: track for a week where you actually ${verb}. The pattern will point to the life area this placement is running.`;
  }

  return { look, tension, help };
}
