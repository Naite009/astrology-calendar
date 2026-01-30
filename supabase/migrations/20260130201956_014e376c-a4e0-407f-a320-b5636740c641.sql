-- Create table for lunar cycle journal entries
CREATE TABLE public.lunar_cycle_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  chart_id TEXT NOT NULL,
  
  -- Cycle identification
  cycle_start_date DATE NOT NULL,
  cycle_sign TEXT NOT NULL,
  cycle_degree INTEGER,
  
  -- New Moon phase journaling
  new_moon_date DATE,
  new_moon_feelings TEXT, -- "What FEELS important right now"
  new_moon_showing_up TEXT, -- "What's SHOWING UP in your life"
  new_moon_house_themes TEXT, -- House this falls in and themes
  new_moon_intentions TEXT, -- Primary intentions for the cycle
  new_moon_body_sensations TEXT, -- How you'd feel with intention present
  
  -- First Quarter phase journaling
  first_quarter_date DATE,
  first_quarter_showing_up TEXT, -- What's showing up
  first_quarter_obstacles TEXT, -- Obstacles encountered
  first_quarter_adjustments TEXT, -- Adjustments being made
  
  -- Full Moon phase journaling
  full_moon_date DATE,
  full_moon_showing_up TEXT, -- What's showing up / illuminated
  full_moon_gratitude TEXT, -- What to be grateful for
  full_moon_releasing TEXT, -- What to release
  
  -- Last Quarter phase journaling
  last_quarter_date DATE,
  last_quarter_showing_up TEXT, -- What's showing up
  last_quarter_letting_go TEXT, -- What are you letting go of
  last_quarter_patterns TEXT, -- Patterns being released
  
  -- Balsamic/Dark Moon phase
  balsamic_date DATE,
  balsamic_reflections TEXT, -- What's showing up within
  balsamic_evolved TEXT, -- What evolved this cycle
  balsamic_different TEXT, -- How am I different
  
  -- Cycle completion reflections
  cycle_wisdom TEXT, -- Wisdom taking into next cycle
  cycle_next_stirrings TEXT, -- What's stirring for next cycle
  
  -- AI suggested intentions (populated by system)
  ai_suggested_intentions TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lunar_cycle_journals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lunar journals"
ON public.lunar_cycle_journals
FOR SELECT
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

CREATE POLICY "Users can insert their own lunar journals"
ON public.lunar_cycle_journals
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own lunar journals"
ON public.lunar_cycle_journals
FOR UPDATE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

CREATE POLICY "Users can delete their own lunar journals"
ON public.lunar_cycle_journals
FOR DELETE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

-- Create trigger for updated_at
CREATE TRIGGER update_lunar_cycle_journals_updated_at
BEFORE UPDATE ON public.lunar_cycle_journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for efficient querying
CREATE INDEX idx_lunar_cycle_journals_device_chart 
ON public.lunar_cycle_journals(device_id, chart_id);

CREATE INDEX idx_lunar_cycle_journals_cycle_start 
ON public.lunar_cycle_journals(cycle_start_date DESC);