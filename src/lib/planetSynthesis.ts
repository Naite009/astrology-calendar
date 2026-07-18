// Chart-specific synthesis for a single planet placement.
// Produces { look, tension, help } — three short sections that read like real advice,
// not generic astrology definitions.
//
// STRICT ORB-PRIORITY LOGIC:
//   1) Sort all aspects to this planet by orb (tightest first).
//   2) PRIMARY  = orb < 2°   → every primary aspect MUST be explained in "tension".
//   3) SECONDARY = 2°–5°     → mentioned as supporting only, never as the defining aspect.
//   4) BACKGROUND = > 5°     → mentioned only if it genuinely adds a new note; never described
//                              as "exact", "fused", or "right on top of".
//   5) If there is no primary aspect, fall back to house, then sign, then dignity, then retrograde.
//
// A wider aspect is NEVER allowed to dominate a tighter aspect.
//
// Rules enforced:
//   - No em dashes
//   - Banned canned phrases: "deepest wound", "greatest healing gift",
//     "feeling the unseen", "dissolving edges", "the place you were hurt",
//     "tell the truth in the room", "right on top of", "fused with",
//     "this energy invites you to", "trust what cannot be proven"
//   - Behavior language: how it shows up at work, relationships, conflict, habits
//   - Use "you may", "you can", "you are likely to"

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
  6: 'work, health, routine, caregiving, and the small responsibilities that keep life running',
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
  Chiron: 'notice pain, disorder, or what is not working that other people overlook',
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

// ---- What another planet, as the "other side" of a hard aspect, pulls on ----
const HARD_PULL: Record<string, string> = {
  Sun: 'be someone specific and get recognized for it',
  Moon: 'protect your comfort, mood, and inner world',
  Mercury: 'stop, think it through, and put it into words',
  Venus: 'want what you actually want, not what is polite',
  Mars: 'act now, push, and stop waiting for permission',
  Jupiter: 'want more, promise more, or believe it will work out',
  Saturn: 'slow down, commit, and take the weight',
  Uranus: 'break the pattern even when it costs you',
  Neptune: 'let go of the hard edges and drift',
  Pluto: 'confront control, secrecy, or powerlessness and refuse to be dismissed',
  Chiron: 'sit with something that still hurts',
  NorthNode: 'grow past your default move',
  SouthNode: 'fall back on the old habit',
  Lilith: 'stop censoring yourself',
  Ceres: 'take care of someone',
  Pallas: 'analyze it before you feel it',
  Juno: 'commit and stay',
  Vesta: 'give it everything and cut everything else out',
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

function isHard(t: ChartAspect['aspectType']): boolean {
  return t === 'square' || t === 'opposition' || t === 'conjunction' || t === 'quincunx';
}

function isSoft(t: ChartAspect['aspectType']): boolean {
  return t === 'trine' || t === 'sextile';
}

// Small planet-name cleanup for prose.
function prose(name: string): string {
  if (name === 'NorthNode') return 'North Node';
  if (name === 'SouthNode') return 'South Node';
  return name;
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

// Aspect-specific verb phrase. Never uses "right on top of" or "fused with".
function aspectPhrase(t: ChartAspect['aspectType']): string {
  switch (t) {
    case 'conjunction': return 'joined to';
    case 'opposition': return 'opposing';
    case 'square': return 'squaring';
    case 'trine': return 'in easy contact with';
    case 'sextile': return 'supported by';
    case 'quincunx': return 'awkwardly linked to';
  }
}

// Describe a single hard aspect in one sentence.
function hardSentence(planet: string, a: ChartAspect): string {
  const other = otherOf(a, planet);
  const pull = HARD_PULL[other] || `pull on ${prose(other)}`;
  const closeness = orbLabel(a.orb);
  const verb = aspectPhrase(a.aspectType);
  return `Your ${closeness} ${a.aspectType} (${a.orb.toFixed(2)}° off exact) has ${prose(planet)} ${verb} ${prose(other)}, so this side of you keeps getting asked to also ${pull}.`;
}

function softSentence(planet: string, a: ChartAspect): string {
  const other = otherOf(a, planet);
  const gift = SOFT_GIFT[other] || `something ${prose(other)} contributes`;
  const closeness = orbLabel(a.orb);
  return `A ${closeness} ${a.aspectType} to ${prose(other)} (${a.orb.toFixed(2)}° off exact) gives you ${gift}, but you have to use it on purpose or it slips by unnoticed.`;
}

export function synthesizePlanet(
  planet: ChartPlanet,
  aspects: ChartAspect[],
  dignity: DignityType
): PlanetSynthesis {
  const verb = PLANET_VERB[planet.name] || `express ${prose(planet.name)}`;
  const style = SIGN_STYLE[planet.sign] || `in a ${planet.sign} way`;
  const domain = planet.house ? HOUSE_DOMAIN[planet.house] : null;

  // --- Tier every aspect strictly by orb ---
  const mine = aspects
    .filter(a => a.planet1 === planet.name || a.planet2 === planet.name)
    // exclude self-opposing node axis noise
    .filter(a => !(
      (planet.name === 'NorthNode' && otherOf(a, planet.name) === 'SouthNode') ||
      (planet.name === 'SouthNode' && otherOf(a, planet.name) === 'NorthNode')
    ))
    .sort((x, y) => x.orb - y.orb);

  const primary = mine.filter(a => a.orb < 2);
  const secondary = mine.filter(a => a.orb >= 2 && a.orb <= 5);
  const background = mine.filter(a => a.orb > 5);

  // --- LOOK: house-first, sign-second. Kept independent of aspect wording. ---
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
    look = `You are likely to ${verb} ${style}. Without a confirmed house, the life area this plays out in is harder to pin down, but the manner stays consistent.`;
  }

  // --- TENSION: primary aspects lead. Every primary must appear. ---
  let tension: string;

  if (primary.length > 0) {
    // Explain each primary aspect in order, tightest first.
    const parts = primary.map(a => {
      return isHard(a.aspectType) ? hardSentence(planet.name, a) : softSentence(planet.name, a);
    });

    // Optionally add ONE supporting note from secondary tier, framed as secondary.
    const supporting = secondary[0];
    if (supporting) {
      const other = otherOf(supporting, planet.name);
      const kind = isHard(supporting.aspectType) ? 'adds pressure' : 'adds a softer note';
      parts.push(`A wider ${supporting.aspectType} to ${prose(other)} (${supporting.orb.toFixed(2)}°) ${kind}, but it is a background influence, not the main driver.`);
    } else if (background[0]) {
      const bg = background[0];
      const other = otherOf(bg, planet.name);
      parts.push(`A wide ${bg.aspectType} to ${prose(other)} (${bg.orb.toFixed(2)}°) is in the mix, but it is background compared to the tight aspect above.`);
    }

    tension = parts.join(' ');
  } else if (secondary.length > 0) {
    // No primary aspect. The tightest secondary becomes the defining note, but framed honestly.
    const a = secondary[0];
    const other = otherOf(a, planet.name);
    if (isHard(a.aspectType)) {
      tension = `The clearest pattern here is a ${a.aspectType} to ${prose(other)} at ${a.orb.toFixed(2)}°. It is not exact, so it works more like a recurring tug than a constant pull: every time you try to ${verb}, part of you also wants to ${HARD_PULL[other] || 'answer ' + prose(other)}.`;
    } else {
      tension = `The clearest support here is a ${a.aspectType} to ${prose(other)} at ${a.orb.toFixed(2)}°. It is not exact, so the help shows up when you reach for it deliberately rather than on its own.`;
    }
    if (secondary[1]) {
      const b = secondary[1];
      tension += ` A second ${b.aspectType} to ${prose(otherOf(b, planet.name))} (${b.orb.toFixed(2)}°) is also in the picture, but as a secondary voice.`;
    }
  } else if (dignity === 'detriment' || dignity === 'fall') {
    tension = `The main challenge is that ${prose(planet.name)} in ${planet.sign} does not get natural backup from the sign, so you may hesitate, over-correct, or downplay this side of yourself in front of others.`;
  } else if (planet.retrograde) {
    tension = `${prose(planet.name)} retrograde suggests this works inward first. You may process it privately for a long time before anyone outside sees a decision.`;
  } else {
    tension = `There is no tight aspect pulling on this placement, so the pattern here is subtle. It shows up more through repetition than through crisis.`;
  }

  // --- HELP: keyed to the tightest primary aspect if any; otherwise house or sign. ---
  let help: string;
  const lead = primary[0] || secondary[0];
  if (lead) {
    const other = otherOf(lead, planet.name);
    if (isHard(lead.aspectType)) {
      if (planet.name === 'Chiron' || other === 'Pluto' || other === 'Chiron') {
        help = `What helps: trust what you notice, but separate identifying a problem from believing you must personally solve or control it.`;
      } else {
        help = `What helps: stop treating ${prose(planet.name)} and ${prose(other)} as opposites you have to pick between, and build one small daily habit that lets both get a turn.`;
      }
    } else {
      const gift = SOFT_GIFT[other] || 'a natural advantage here';
      help = `What helps: name this out loud. You have ${gift}, and the gift only pays off when you use it on purpose instead of assuming everyone else can do it too.`;
    }
  } else if (domain) {
    help = `What helps: pick one recurring situation in ${domain} and practice ${verb} there deliberately, so the placement gets rehearsed instead of only reacted to.`;
  } else {
    help = `What helps: track for a week where you actually ${verb}. The pattern will point to the life area this placement is running.`;
  }

  return { look, tension, help };
}
