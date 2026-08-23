CREATE TABLE public.soul_agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  chart_id text NOT NULL,
  chart_name text,
  agreements jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chart_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.soul_agreements TO authenticated;
GRANT ALL ON public.soul_agreements TO service_role;

ALTER TABLE public.soul_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own soul agreements"
  ON public.soul_agreements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_soul_agreements_user ON public.soul_agreements(user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_soul_agreements_updated_at
  BEFORE UPDATE ON public.soul_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();