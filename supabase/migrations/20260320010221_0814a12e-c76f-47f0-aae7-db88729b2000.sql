
-- New columns for the workshop-style lunar journal
ALTER TABLE public.lunar_cycle_journals
  ADD COLUMN IF NOT EXISTS what_is_surfacing text,
  ADD COLUMN IF NOT EXISTS balsamic_dreams text,
  ADD COLUMN IF NOT EXISTS balsamic_morning_thoughts text,
  ADD COLUMN IF NOT EXISTS balsamic_fatigue smallint,
  ADD COLUMN IF NOT EXISTS balsamic_withdrawal smallint,
  ADD COLUMN IF NOT EXISTS balsamic_needs_to_end text,
  ADD COLUMN IF NOT EXISTS balsamic_what_feels_complete text,
  ADD COLUMN IF NOT EXISTS balsamic_off_plate text,
  ADD COLUMN IF NOT EXISTS intention_status text DEFAULT 'unclear',
  ADD COLUMN IF NOT EXISTS surprise_event text,
  ADD COLUMN IF NOT EXISTS real_life_what_happened text,
  ADD COLUMN IF NOT EXISTS real_life_surprises text,
  ADD COLUMN IF NOT EXISTS real_life_body_signals text,
  ADD COLUMN IF NOT EXISTS real_life_synchronicities text,
  ADD COLUMN IF NOT EXISTS real_life_conversations text,
  ADD COLUMN IF NOT EXISTS real_life_emotional_reactions text,
  ADD COLUMN IF NOT EXISTS real_life_repeated text,
  ADD COLUMN IF NOT EXISTS simple_mode boolean DEFAULT true;
