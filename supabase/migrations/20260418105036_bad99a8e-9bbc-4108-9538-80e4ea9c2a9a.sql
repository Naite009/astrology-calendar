
CREATE TABLE public.ask_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  chart_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  prompt TEXT NOT NULL,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ask_jobs_user_chart ON public.ask_jobs(user_id, chart_id, created_at DESC);
CREATE INDEX idx_ask_jobs_status ON public.ask_jobs(status, created_at DESC);

ALTER TABLE public.ask_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ask jobs"
ON public.ask_jobs FOR SELECT
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND (user_id IS NULL)));

CREATE POLICY "Users can insert their own ask jobs"
ON public.ask_jobs FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own ask jobs"
ON public.ask_jobs FOR UPDATE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND (user_id IS NULL)));

CREATE TRIGGER ask_jobs_updated_at
BEFORE UPDATE ON public.ask_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.ask_jobs;
