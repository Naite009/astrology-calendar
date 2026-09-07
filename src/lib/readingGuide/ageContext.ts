/**
 * Developmental context for the Reading Guide tab.
 *
 * Age is a real interpretation input here, not a tone switch: it decides which
 * life arena a house or planet is translated into, and how firmly a statement
 * may be phrased. Shared so any future surface can reuse the same translation.
 */

export type AgeStage = 'child' | 'teen' | 'adult';

export interface AgeContext {
  /** Whole years at the reading date, or null when the birth date is unusable. */
  years: number | null;
  stage: AgeStage;
  /** 'birthdate' when derived from the chart, 'override' when the reader picked it. */
  source: 'birthdate' | 'override' | 'default';
  label: string;
}

export function calculateAgeYears(birthDate: string, at: Date = new Date()): number | null {
  if (!birthDate) return null;
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || !mo || !d) return null;
  let age = at.getFullYear() - y;
  const beforeBirthday =
    at.getMonth() + 1 < mo || (at.getMonth() + 1 === mo && at.getDate() < d);
  if (beforeBirthday) age -= 1;
  if (age < 0 || age > 130) return null;
  return age;
}

export function stageForAge(years: number | null): AgeStage {
  if (years == null) return 'adult';
  if (years < 12) return 'child';
  if (years < 20) return 'teen';
  return 'adult';
}

export const STAGE_LABELS: Record<AgeStage, string> = {
  child: 'Child',
  teen: 'Teen',
  adult: 'Adult',
};

export function buildAgeContext(
  birthDate: string,
  override?: AgeStage | null,
  at: Date = new Date()
): AgeContext {
  const years = calculateAgeYears(birthDate, at);
  const stage = override ?? stageForAge(years);
  return {
    years,
    stage,
    source: override ? 'override' : years != null ? 'birthdate' : 'default',
    label: STAGE_LABELS[stage],
  };
}

/**
 * How each house reads at each stage. Adult wording keeps normal life context;
 * child and teen wording moves the same symbolism into school, family, friends,
 * hobbies, routines, and developing competence.
 */
export const HOUSE_BY_STAGE: Record<number, Record<AgeStage, string>> = {
  1: {
    child: 'how they come across, first impressions, how they enter a new room',
    teen: 'how you come across, your look and style, how you start things',
    adult: 'identity, presence, how you meet the world',
  },
  2: {
    child: 'feeling secure, what they treasure, doing things by themselves',
    teen: 'values, security, independence, and self-worth (what makes you feel capable)',
    adult: 'values, resources, self-worth, and material security',
  },
  3: {
    child: 'talking, learning, siblings, neighbourhood, curiosity',
    teen: 'school, learning style, everyday talking, siblings, short trips',
    adult: 'communication, learning, siblings, daily information flow',
  },
  4: {
    child: 'home, family, feeling safe, private inner world',
    teen: 'home, family, your private life, and where you recharge',
    adult: 'home, family, roots, emotional foundation',
  },
  5: {
    child: 'play, creativity, fun, being noticed for what they make',
    teen: 'creativity, fun, hobbies, confidence, self-expression',
    adult: 'creativity, pleasure, self-expression, romance, children',
  },
  6: {
    child: 'routines, daily habits, helping, practising a skill',
    teen: 'routines, school and work habits, practice, skill-building, responsibility',
    adult: 'work, routine, health habits, craft and service',
  },
  7: {
    child: 'close friendships, sharing, fairness with others',
    teen: 'friendships, closeness, trust, and your style in one-to-one relationships',
    adult: 'partnership, close relationships, agreements',
  },
  8: {
    child: 'big feelings, trust, privacy, deep questions',
    teen: 'trust, privacy, deep feelings, and what you share only with a few people',
    adult: 'shared resources, intimacy, depth, transformation',
  },
  9: {
    child: 'wondering about the world, travel, stories, beliefs',
    teen: 'big-picture learning, beliefs, travel, and what you want to explore',
    adult: 'belief, higher learning, travel, meaning',
  },
  10: {
    child: 'being seen by grown-ups, reputation, what they want to be',
    teen: 'interests, school strengths, future direction, and developing competence',
    adult: 'career, public role, long-term direction',
  },
  11: {
    child: 'groups, teams, belonging, friends',
    teen: 'friend groups, belonging, causes you care about, hopes',
    adult: 'community, networks, shared goals, hopes',
  },
  12: {
    child: 'quiet time, imagination, needing space to rest',
    teen: 'inner life, imagination, rest, and needing time alone',
    adult: 'inner life, rest, imagination, what happens behind the scenes',
  },
};

export function houseArena(house: number, stage: AgeStage): string {
  return HOUSE_BY_STAGE[house]?.[stage] ?? '';
}

/**
 * Vocabulary swaps applied to every generated sentence, so an adult-shaped
 * phrase never reaches a child or teen reading.
 */
const STAGE_REWRITES: Record<AgeStage, Array<[RegExp, string]>> = {
  adult: [],
  teen: [
    [/\bcareer\b/gi, 'future direction'],
    [/\bmarriage\b/gi, 'close relationships'],
    [/\bspouse\b/gi, 'someone close to you'],
    [/\bfinances\b/gi, 'what you value and how you handle money you earn'],
    [/\bincome\b/gi, 'money you earn'],
    [/\bsexuality\b/gi, 'closeness'],
    [/\bsexual\b/gi, 'close'],
    [/\byour job\b/gi, 'your school and work habits'],
    [/\bhealth\b/gi, 'energy, rest, and routines'],
    [/\bkarmic\b/gi, 'long-term growth'],
  ],
  child: [
    [/\bcareer\b/gi, 'interests and strengths'],
    [/\bmarriage\b/gi, 'close friendships'],
    [/\bspouse\b/gi, 'a close friend'],
    [/\bfinances\b/gi, 'what feels valuable to them'],
    [/\bincome\b/gi, 'what they earn or save'],
    [/\bromance\b/gi, 'close friendship'],
    [/\bsexuality\b/gi, 'closeness'],
    [/\bsexual\b/gi, 'close'],
    [/\bhealth\b/gi, 'energy, rest, and routines'],
    [/\bkarmic\b/gi, 'long-term growth'],
  ],
};

/** Second-person for teen/adult, third-person parent-facing for child. */
export function voiceFor(stage: AgeStage): 'you' | 'they' {
  return stage === 'child' ? 'they' : 'you';
}

export function applyStageVocabulary(text: string, stage: AgeStage): string {
  let out = text;
  for (const [re, replacement] of STAGE_REWRITES[stage]) {
    out = out.replace(re, replacement);
  }
  if (stage === 'child') {
    out = out
      .replace(/\byou are\b/gi, 'they are')
      .replace(/\byou may\b/gi, 'they may')
      .replace(/\byou can\b/gi, 'they can')
      .replace(/\byou tend\b/gi, 'they tend')
      .replace(/\byou often\b/gi, 'they often')
      .replace(/\byour\b/gi, 'their')
      .replace(/\byou\b/gi, 'they');
  }
  return out;
}
