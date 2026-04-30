CREATE TABLE public.ask_generation_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  user_id uuid,
  chart_id text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  system_prompt text,
  user_messages jsonb,
  chart_context text,
  raw_ai_response text,
  model text,
  finish_reason text,
  notes text
);

ALTER TABLE public.ask_generation_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ask captures"
ON public.ask_generation_captures
FOR SELECT
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND (user_id IS NULL)));

CREATE POLICY "Users can insert their own ask captures"
ON public.ask_generation_captures
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE INDEX idx_ask_captures_job_id ON public.ask_generation_captures(job_id);
CREATE INDEX idx_ask_captures_user_captured ON public.ask_generation_captures(user_id, captured_at DESC);