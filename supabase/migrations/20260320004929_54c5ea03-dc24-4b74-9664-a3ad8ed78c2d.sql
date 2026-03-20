
-- Add tracking metrics to lunar_cycle_journals
ALTER TABLE public.lunar_cycle_journals
  ADD COLUMN IF NOT EXISTS mood smallint,
  ADD COLUMN IF NOT EXISTS energy smallint,
  ADD COLUMN IF NOT EXISTS clarity smallint,
  ADD COLUMN IF NOT EXISTS stress smallint,
  ADD COLUMN IF NOT EXISTS sleep_quality smallint,
  ADD COLUMN IF NOT EXISTS communication_quality smallint,
  ADD COLUMN IF NOT EXISTS social_ease smallint,
  ADD COLUMN IF NOT EXISTS intuition smallint,
  ADD COLUMN IF NOT EXISTS productivity smallint,
  ADD COLUMN IF NOT EXISTS conflict_level smallint,
  ADD COLUMN IF NOT EXISTS dream_intensity smallint,
  ADD COLUMN IF NOT EXISTS body_sensitivity smallint,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS journal_text text,
  ADD COLUMN IF NOT EXISTS moon_house smallint,
  ADD COLUMN IF NOT EXISTS house_system text DEFAULT 'placidus';
