
ALTER TABLE public.ask_generation_captures
  ADD COLUMN IF NOT EXISTS chart_name text,
  ADD COLUMN IF NOT EXISTS question text;

CREATE INDEX IF NOT EXISTS ask_generation_captures_chart_name_idx
  ON public.ask_generation_captures (chart_name);

-- Backfill chart_name from "for <Name>, born" pattern in the last user message
UPDATE public.ask_generation_captures
SET chart_name = COALESCE(
  chart_name,
  (regexp_match(
    (user_messages -> -1 ->> 'content'),
    'for ([A-Z][A-Za-z''\-]+(?:\s[A-Z][A-Za-z''\-]+){0,3}),\s+born'
  ))[1]
)
WHERE chart_name IS NULL
  AND user_messages IS NOT NULL;

-- Backfill question with the first ~200 chars of the last user message
UPDATE public.ask_generation_captures
SET question = COALESCE(
  question,
  substring((user_messages -> -1 ->> 'content') from 1 for 240)
)
WHERE question IS NULL
  AND user_messages IS NOT NULL;
