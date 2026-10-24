/** Shared client/server routing. A known topic ID always beats prompt words. */
export const QUICK_TOPIC_CATEGORIES = {
  daily_weather: 'general', natal: 'natal', narrative: 'narrative',
  sacred_directive: 'sacred_directive', solar_return: 'solar_return',
  relocation: 'relocation', relationship: 'relationship', finding_partner: 'relationship',
  career: 'career', health: 'health', money: 'money', spiritual: 'spiritual', parenting: 'parenting',
} as const;
export type ReadingCategory = typeof QUICK_TOPIC_CATEGORIES[keyof typeof QUICK_TOPIC_CATEGORIES];
export interface TopicRouting { topicId?: string; category?: ReadingCategory }
export function explicitTopicCategory(meta?: TopicRouting): ReadingCategory | null {
  if (!meta) return null;
  if (meta.topicId && Object.prototype.hasOwnProperty.call(QUICK_TOPIC_CATEGORIES, meta.topicId)) {
    return QUICK_TOPIC_CATEGORIES[meta.topicId as keyof typeof QUICK_TOPIC_CATEGORIES];
  }
  return meta.category && Object.values(QUICK_TOPIC_CATEGORIES).includes(meta.category) ? meta.category : null;
}
export function resolveReadingCategory(question: string, meta: TopicRouting | undefined, freeForm: (question: string) => ReadingCategory): ReadingCategory {
  const explicit = explicitTopicCategory(meta);
  return explicit ?? (meta?.topicId ? 'general' : freeForm(question));
}