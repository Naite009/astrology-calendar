-- Add tarot and oracle card fields to lunar_cycle_journals
ALTER TABLE public.lunar_cycle_journals
ADD COLUMN IF NOT EXISTS tarot_card_name text,
ADD COLUMN IF NOT EXISTS tarot_card_notes text,
ADD COLUMN IF NOT EXISTS tarot_ai_interpretation text,
ADD COLUMN IF NOT EXISTS oracle_card_name text,
ADD COLUMN IF NOT EXISTS oracle_deck_name text,
ADD COLUMN IF NOT EXISTS oracle_card_notes text,
ADD COLUMN IF NOT EXISTS oracle_ai_interpretation text;