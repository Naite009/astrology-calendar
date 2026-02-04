-- DB-backed cache for daily Cosmic Weather + Cosmic Kitchen
CREATE TABLE IF NOT EXISTS public.cosmic_weather_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  device_id TEXT NOT NULL DEFAULT '',
  date_key TEXT NOT NULL, -- YYYY-MM-DD in user's local calendar
  voice_style TEXT NOT NULL DEFAULT '',
  chart_id TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create a unique index on the composite key (simpler approach)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cosmic_cache_unique 
ON public.cosmic_weather_cache (date_key, device_id, voice_style, chart_id);

ALTER TABLE public.cosmic_weather_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cosmic cache (device-based for non-logged-in, user-based for logged-in)
CREATE POLICY "Anyone can read cosmic cache"
ON public.cosmic_weather_cache
FOR SELECT
USING (TRUE);

-- Anyone can insert 
CREATE POLICY "Anyone can insert cosmic cache"
ON public.cosmic_weather_cache
FOR INSERT
WITH CHECK (TRUE);

-- Anyone can update
CREATE POLICY "Anyone can update cosmic cache"
ON public.cosmic_weather_cache
FOR UPDATE
USING (TRUE);

-- Index for cleanup/queries by date
CREATE INDEX IF NOT EXISTS idx_cosmic_weather_cache_date
ON public.cosmic_weather_cache (date_key);

-- Keep updated_at fresh
CREATE TRIGGER cosmic_weather_cache_updated_at
BEFORE UPDATE ON public.cosmic_weather_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();