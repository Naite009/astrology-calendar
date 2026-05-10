-- Cache generated family readings so users don't have to regenerate
CREATE TABLE public.family_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('pair', 'system')),
  cache_key TEXT NOT NULL,
  label TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, reading_type, cache_key)
);

CREATE INDEX idx_family_readings_user ON public.family_readings(user_id, created_at DESC);

ALTER TABLE public.family_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own family readings" ON public.family_readings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own family readings" ON public.family_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own family readings" ON public.family_readings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own family readings" ON public.family_readings
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_family_readings_updated_at
  BEFORE UPDATE ON public.family_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();