import { describe, it, expect, vi } from 'vitest';
import { QUICK_TOPIC_CATEGORIES, explicitTopicCategory, resolveReadingCategory } from '../../../supabase/functions/_shared/quickTopicRouting';
import { QUICK_TOPICS } from '../../components/AskQuickTopics';
describe('non-negotiable structured topic routing', () => {
  it('finding_partner routes relationship even when metadata and work keywords say career', () => {
    const fallback = vi.fn(() => 'career' as const);
    expect(resolveReadingCategory('work career job industry professional', {topicId:'finding_partner',category:'career'}, fallback)).toBe('relationship');
    expect(fallback).not.toHaveBeenCalled();
  });
  it.each(Object.entries(QUICK_TOPIC_CATEGORIES))('%s uses its declared category', (topicId, category) => {
    const fallback = vi.fn(() => 'career' as const);
    expect(resolveReadingCategory('work relationship money health travel', {topicId}, fallback)).toBe(category);
    expect(fallback).not.toHaveBeenCalled();
  });
  it('every visible structured quick topic has routing metadata', () => {
    expect(QUICK_TOPICS.every(t=>explicitTopicCategory({topicId:t.id})!==null)).toBe(true);
  });
  it('uses explicit category when an ID is not in the registry', () => {
    expect(resolveReadingCategory('work', {category:'relationship'}, ()=>'career')).toBe('relationship');
  });
  it('keywords apply only to free-form questions', () => {
    const fallback = vi.fn(() => 'career' as const);
    expect(resolveReadingCategory('work', undefined, fallback)).toBe('career');
    expect(fallback).toHaveBeenCalledOnce();
    fallback.mockClear();
    expect(resolveReadingCategory('work', {topicId:'unknown'}, fallback)).toBe('general');
    expect(fallback).not.toHaveBeenCalled();
  });
});