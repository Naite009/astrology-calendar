ALTER TABLE public.ask_jobs
  ADD COLUMN IF NOT EXISTS call_a_output jsonb,
  ADD COLUMN IF NOT EXISTS call_b_output jsonb,
  ADD COLUMN IF NOT EXISTS call_c_output jsonb,
  ADD COLUMN IF NOT EXISTS call_status   jsonb NOT NULL DEFAULT '{}'::jsonb;