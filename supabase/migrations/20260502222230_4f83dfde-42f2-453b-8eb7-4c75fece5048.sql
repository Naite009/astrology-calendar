
CREATE TABLE public.family_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  member_chart_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  role TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own family members"
  ON public.family_relationships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own family members"
  ON public.family_relationships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own family members"
  ON public.family_relationships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own family members"
  ON public.family_relationships FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_family_relationships_updated_at
  BEFORE UPDATE ON public.family_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_family_relationships_user ON public.family_relationships(user_id);
