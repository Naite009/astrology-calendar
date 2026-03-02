import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DocumentExcerpt {
  id: string;
  fileName: string;
  excerpt: string;
}

const MAX_CHARS_PER_DOC = 4000;
const MAX_TOTAL_CHARS = 12000;

/**
 * Fetches extracted text from the user's uploaded reference documents
 * and returns truncated excerpts suitable for injection into AI prompts.
 */
export function useDocumentExcerpts() {
  const { user } = useAuth();
  const [excerpts, setExcerpts] = useState<DocumentExcerpt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExcerpts = useCallback(async () => {
    if (!user) {
      setExcerpts([]);
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('astrology_documents')
        .select('id, file_name, extracted_text')
        .eq('user_id', user.id)
        .eq('extraction_status', 'success')
        .not('extracted_text', 'is', null)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setExcerpts([]);
        return [];
      }

      // Truncate each document and cap total size
      let totalChars = 0;
      const result: DocumentExcerpt[] = [];

      for (const doc of data) {
        if (!doc.extracted_text || totalChars >= MAX_TOTAL_CHARS) break;
        const remaining = MAX_TOTAL_CHARS - totalChars;
        const maxForThis = Math.min(MAX_CHARS_PER_DOC, remaining);
        const excerpt = doc.extracted_text.slice(0, maxForThis);
        totalChars += excerpt.length;
        result.push({
          id: doc.id,
          fileName: doc.file_name,
          excerpt,
        });
      }

      setExcerpts(result);
      return result;
    } catch (err) {
      console.error('Error fetching document excerpts:', err);
      setExcerpts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExcerpts();
  }, [fetchExcerpts]);

  /**
   * Build a formatted string suitable for inserting into an AI prompt.
   * Returns empty string if no excerpts available.
   */
  const buildPromptBlock = useCallback((): string => {
    if (excerpts.length === 0) return '';
    const blocks = excerpts.map(e =>
      `--- ${e.fileName} ---\n${e.excerpt}`
    );
    return `\nREFERENCE MATERIAL FROM USER'S ASTROLOGY LIBRARY (use these to enrich and ground your interpretations — cite the source when drawing from this material):\n${blocks.join('\n\n')}\n`;
  }, [excerpts]);

  return {
    excerpts,
    loading,
    fetchExcerpts,
    buildPromptBlock,
    hasExcerpts: excerpts.length > 0,
  };
}
