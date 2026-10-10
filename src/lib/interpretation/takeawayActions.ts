import type { DevelopmentalStage } from './psychologicalFunctions';

export type TakeawayCategory = 'sharing' | 'motives' | 'selfWorth' | 'boundaries' | 'communication' | 'emotions' | 'perfectionism' | 'rest' | 'relationships' | 'direction';
export interface TakeawayAction {
  category: TakeawayCategory;
  behaviors: string[];
}

const ACTIONS: Record<TakeawayCategory, string[]> = {
  sharing: [
    'Choose one task this week that you normally handle alone and ask someone to own one part of it. Agree on what needs to be done and when.',
    'Do not redo their part unless there is a real consequence. If a change is needed, explain it and ask them to make it.',
  ],
  motives: [
    'Before deciding why someone acted that way this week, write three lines: what I know, what I am guessing, and what I need to ask directly.',
    'Name your own feeling and need before analyzing their motive. Ask one clear question instead of treating your guess as fact.',
  ],
  selfWorth: [
    'Once this week, do something enjoyable with no productive outcome.',
    'Let one low-stakes task be good enough rather than perfect.',
    'Write down one thing you value about yourself that has nothing to do with achievement or usefulness.',
  ],
  boundaries: [
    'Before accepting one request this week, check your time and energy. Say what you can offer and what you cannot.',
    'Use one short sentence, such as “I can help for twenty minutes, but I cannot take this on.” Avoid adding a long apology.',
  ],
  communication: [
    'Before one conversation this week, write the point you want to make in one sentence, with one concrete example.',
    'Say it, then ask the other person what they understood. Listen to their answer before explaining again.',
  ],
  emotions: [
    'When you feel stirred up this week, pause and write “I feel…” and “I need…” before deciding what to do.',
    'If you need time, say “I need a short pause. Can we return to this in twenty minutes?” Return at the agreed time.',
  ],
  perfectionism: [
    'For one low-stakes task this week, write down what counts as finished before starting and set a time limit.',
    'Stop when those conditions are met. Leave one harmless detail unpolished and notice whether it changes the result.',
  ],
  rest: [
    'Put twenty minutes of unmeasured enjoyment on your calendar this week: draw, listen to music, play, or take an easy walk.',
    'Keep that time free of errands, progress tracking, and catching up on work.',
  ],
  relationships: [
    'In one shared plan this week, name your preference and ask the other person for theirs before agreeing.',
    'Ask for one specific kind of support, such as ten minutes of listening without advice. Check what they can offer.',
  ],
  direction: [
    'Choose one low-stakes decision you have postponed this week. Write down two options and one reason for each, then pick one to test for twenty minutes.',
    'After the test, write what happened and whether you want to continue or change course. You do not need to settle the whole plan at once.',
  ],
};

// Match the generated chart theme, not the client's name or birth record.
// Specific mechanisms take precedence over broad relationship/emotional words.
const THEME_RULES: Array<[TakeawayCategory, RegExp]> = [
  ['sharing', /(?:let(?:ting)? others help|shar(?:e|ing) (?:your )?responsibilit|delegat|handle alone|do(?:ing)? everything|asking for help|self.reliance|carrying.*(?:alone|yourself)|receiv.*support)/i],
  ['motives', /(?:motiv|over.analy|intellect.*shield|assumptions|suspici|second.guess|hidden meaning)/i],
  ['selfWorth', /(?:self.worth|self worth|worth.*(?:productiv|achievement|useful)|prov(?:e|ing).*value|security.*(?:own|productiv)|earn.*care)/i],
  ['boundaries', /(?:boundar|saying no|say no|over.accommodat|over.carry|limits|resent|overrid|manag.*other people's emotions|soften.*(?:need|opinion)|taking on.*emotional weight)/i],
  ['perfectionism', /(?:perfect|control|critical|criticis|competence|discipline|standards|fix everything)/i],
  ['rest', /(?:rest|play|pleasure|enjoy|nourish|burnout|tired|sensory|pacing)/i],
  ['communication', /(?:communicat|speak|speaking|words|listen|conversation|say.*want|telling the truth|clear.*question|learning|curiosity|express|explain|put.*(?:word|paper)|teach|input|feel understood)/i],
  ['emotions', /(?:feeling|emotion|vulnerab|settle|regulat|inner need|pause|react|private)/i],
  ['relationships', /(?:relationship|partner|closeness|trust|bond|mutual|compromise|connection|affection)/i],
];

export function buildTakeawayAction(
  pattern: string,
  options: { category?: TakeawayCategory; context?: string; stage?: DevelopmentalStage } = {},
): TakeawayAction {
  const category = options.category
    ?? THEME_RULES.find(([, rule]) => rule.test(pattern))?.[0]
    ?? THEME_RULES.find(([, rule]) => rule.test(options.context ?? ''))?.[0]
    ?? 'direction';
  let behaviors = [...ACTIONS[category]];
  if (options.stage === 'child' && category === 'sharing') {
    behaviors = ['Choose one small chore or project this week and ask a trusted adult to help you share the steps.', 'Let the other person finish their part. Ask the adult for help if something important needs changing.'];
  }
  return { category, behaviors };
}

export const TAKEAWAY_SUMMARY_FIELDS = [
  ['whatToPractice', 'What to practice'],
  ['whatToWatchFor', 'What to watch for'],
  ['whatToBuild', 'What to build'],
  ['whatToGive', 'What to give'],
  ['integration', 'Integration'],
] as const;

export type TakeawaySummaryKey = typeof TAKEAWAY_SUMMARY_FIELDS[number][0];
export type TakeawaySummaryActions = Partial<Record<TakeawaySummaryKey, TakeawayAction>>;

export function buildSummaryActions(summary: Partial<Record<TakeawaySummaryKey, string>>, stage?: DevelopmentalStage): TakeawaySummaryActions {
  return Object.fromEntries(TAKEAWAY_SUMMARY_FIELDS.flatMap(([key]) => {
    const text = summary[key];
    return text?.trim() ? [[key, buildTakeawayAction(text, { stage })]] : [];
  }));
}

export function actionText(action: TakeawayAction): string {
  return action.behaviors.join(' ');
}