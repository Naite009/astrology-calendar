/**
 * Felt-sense copy for all 27 nakshatras.
 * essence: what it looks like in behavior
 * gift: the usable talent
 * friction: the recurring cost, named plainly and without doom language
 */

export interface NakshatraCopy {
  essence: string;
  gift: string;
  friction: string;
}

export const NAKSHATRA_COPY: Record<string, NakshatraCopy> = {
  Ashwini: {
    essence: 'you move first and think while moving, and you are usually the one people call when something needs fixing right now',
    gift: 'fast starts, quick repair, an instinct for what will help before anyone has explained the problem',
    friction: 'you begin more than you finish, and the rush that makes you useful also keeps you from sitting still long enough to feel what you actually want',
  },
  Bharani: {
    essence: 'you carry things through to the end, including the parts other people put down, and you have a low tolerance for pretending',
    gift: 'endurance, honesty about hard facts, the ability to hold a heavy situation without dropping it',
    friction: 'you take on more weight than is yours, then resent the people who let you, and you rarely say so out loud until it has built up',
  },
  Krittika: {
    essence: 'you cut through vagueness, and people either find you clarifying or find you sharp, sometimes both in the same conversation',
    gift: 'clean discernment, high standards, the willingness to name the thing everyone is dancing around',
    friction: 'the same blade turns inward, and you can be harder on yourself than on anyone you have ever criticized',
  },
  Rohini: {
    essence: 'you build slowly and beautifully, and you want what you make to last and to feel good to be around',
    gift: 'steadiness, taste, an ability to grow something real out of patient attention',
    friction: 'you attach to comfort and to people, and letting go of what has stopped working takes you longer than it should',
  },
  Mrigashira: {
    essence: 'you are searching, always slightly scanning, looking for the thing that will finally feel like the right fit',
    gift: 'curiosity, sensitivity to detail, a talent for finding what others walked past',
    friction: 'the search itself becomes the habit, and you second-guess good choices because a better one might exist',
  },
  Ardra: {
    essence: 'you have lived through storms and you know their shape, so intensity does not scare you the way it scares other people',
    gift: 'honest emotional range, staying power in crisis, insight that came the expensive way',
    friction: 'you brace for the storm even in calm weather, and the bracing costs more than the storms do',
  },
  Punarvasu: {
    essence: 'you return, rebuild, and start again, and you keep an underlying optimism that most things can be recovered',
    gift: 'resilience, generosity, the ability to make almost anywhere feel like home',
    friction: 'you keep going back to the same doorway, personal or professional, hoping this time it stays open',
  },
  Pushya: {
    essence: 'you feed people, literally or otherwise, and being the reliable one is so automatic that you barely notice doing it',
    gift: 'nourishment, loyalty, an atmosphere around you that makes others settle down',
    friction: 'you give first and count later, and you can end up quietly waiting for care you never actually asked for',
  },
  Ashlesha: {
    essence: 'being highly alert to subtext, motives, emotional complexity and what may not be openly expressed, while keeping most of that reading private',
    gift: 'strategic intelligence, emotional accuracy, the ability to survive complicated situations',
    friction: 'you hold on tightly when you feel unsafe, and closeness can start to feel like something to manage rather than enjoy',
  },
  Magha: {
    essence: 'you carry your family line with you, honoring it or working against it, and you want your effort to mean something to those who come after',
    gift: 'natural authority, dignity, a sense of duty that people can lean on',
    friction: 'you measure yourself against ancestors and expectations, and pride can keep you from asking for what would make it easier',
  },
  'Purva Phalguni': {
    essence: 'you want life to have pleasure in it, and you are unapologetic about rest, beauty and good company',
    gift: 'warmth, charm, an ability to make people feel chosen',
    friction: 'you avoid the unglamorous middle of things, and the delay of hard tasks eventually collects interest',
  },
  'Uttara Phalguni': {
    essence: 'you build through commitments, agreements and reliable help, and you take your word seriously',
    gift: 'trustworthiness, generosity with structure, friendships that turn into partnerships',
    friction: 'you over-function in relationships, then feel unseen, and you rarely renegotiate the terms you agreed to years ago',
  },
  Hasta: {
    essence: 'you are skilled with your hands and your details, and you notice the small thing that makes the whole thing work',
    gift: 'craft, precision, a talent for making something out of very little',
    friction: 'you fix and adjust past the point of usefulness, and control becomes a way to manage anxiety',
  },
  Chitra: {
    essence: 'you make things that look right, and you have a strong internal eye for design, image and presentation',
    gift: 'aesthetic intelligence, visible excellence, a knack for standing out without shouting',
    friction: 'you tie worth to the finished look, and the gap between the polish and the private mess wears on you',
  },
  Swati: {
    essence: 'you need room to move and choose, and independence matters to you more than most people realize',
    gift: 'adaptability, fair dealing, the ability to work anywhere and with anyone',
    friction: 'you keep a little distance so nothing can trap you, and that distance can read as unavailable to the people who want you close',
  },
  Vishakha: {
    essence: 'you are goal-driven in a way that surprises people, and you will wait a long time for the thing you actually want',
    gift: 'ambition with patience, sharp focus, the ability to finish what you set out to do',
    friction: 'you live in the not-yet, and the moment one goal completes you replace it before you have felt it',
  },
  Anuradha: {
    essence: 'you follow through on people, and your friendships and alliances are usually long and genuinely mutual',
    gift: 'devotion, diplomacy, the ability to lead without needing to dominate',
    friction: 'you stay loyal past the expiry date, and you feel deeply hurt by exclusion even when it was not personal',
  },
  Jyeshtha: {
    essence: 'you ended up being the responsible one, formally or not, and you carry more than the people around you know',
    gift: 'competence under pressure, protective strength, hard-won authority',
    friction: 'you resent being the one who holds it and also refuse to hand it over, and the tiredness turns into edge',
  },
  Mula: {
    essence: 'you go to the root, in questions and in relationships, and you cannot stay comfortable inside a surface answer',
    gift: 'investigative depth, honesty about what is really going on, the ability to start over from nothing',
    friction: 'the digging sometimes uproots things that were fine, and endings you initiated still leave you unsteady',
  },
  'Purva Ashadha': {
    essence: 'you have an unshakeable position on things you believe, and you do not fold under argument',
    gift: 'conviction, persuasive force, the confidence to keep going when others quit',
    friction: 'certainty hardens, and you defend a stance long after new information has shown up',
  },
  'Uttara Ashadha': {
    essence: 'you win by lasting, and your best results come from the long unglamorous middle rather than a lucky break',
    gift: 'stamina, integrity, leadership that people accept because it was earned',
    friction: 'you refuse help and call it independence, and the load stays heavier than it needs to be',
  },
  Shravana: {
    essence: 'you listen for a living, whether you get paid for it or not, and people tell you things they were not planning to say',
    gift: 'deep listening, learning by ear, an ability to translate between people',
    friction: 'you absorb everyone else\u2019s material, and it is hard to tell your own opinion from the loudest voice you took in',
  },
  Dhanishta: {
    essence: 'you have rhythm and drive, and you like being in the room where things are being built or performed',
    gift: 'competence with resources, timing, an ability to make success visible',
    friction: 'you keep tempo even when you are exhausted, and slowing down feels like losing',
  },
  Shatabhisha: {
    essence: 'you sit slightly outside the group, watching, and you often turn out to be right about the thing nobody wanted to hear',
    gift: 'independent thinking, healing insight, an unusual angle that solves stuck problems',
    friction: 'the outsider seat becomes a habit, and you keep yourself apart even where you would be welcome',
  },
  'Purva Bhadrapada': {
    essence: 'you feel the weight of things, and you have a strong sense of what is at stake that other people find intense',
    gift: 'depth, courage about mortality and truth, the ability to transform under pressure',
    friction: 'you carry existential dread as background noise, and it can turn into either burnout or an all-or-nothing move',
  },
  'Uttara Bhadrapada': {
    essence: 'you are steady in deep water, and people bring you their heaviest things because you do not flinch',
    gift: 'compassion with boundaries, patience, wisdom that is genuinely calming',
    friction: 'you withdraw when it gets too much instead of saying it is too much, and the retreat looks like coldness',
  },
  Revati: {
    essence: 'you get people safely from one place to the next, and you are kind in ways that cost you something',
    gift: 'care, imagination, a real talent for endings and handovers',
    friction: 'you give until there is nothing left for you, and boundaries feel unkind rather than necessary',
  },
};

export function nakshatraCopy(name: string): NakshatraCopy {
  return NAKSHATRA_COPY[name] || {
    essence: 'this lunar mansion colors how your instincts fire before thought catches up',
    gift: 'a specific instinct that shows up under pressure',
    friction: 'the same instinct running past the point of usefulness',
  };
}
