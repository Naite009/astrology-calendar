ALTER TABLE public.cosmic_weather_cache
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS body_html text;