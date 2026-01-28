-- Create life_events table for storing user life events
CREATE TABLE public.life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  chart_id TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  event_label TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own life events"
ON public.life_events
FOR SELECT
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

CREATE POLICY "Users can insert their own life events"
ON public.life_events
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own life events"
ON public.life_events
FOR UPDATE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

CREATE POLICY "Users can delete their own life events"
ON public.life_events
FOR DELETE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

-- Create index for faster queries
CREATE INDEX idx_life_events_chart ON public.life_events(chart_id, device_id);
CREATE INDEX idx_life_events_user ON public.life_events(user_id);
CREATE INDEX idx_life_events_date ON public.life_events(event_date);

-- Add trigger for updated_at
CREATE TRIGGER update_life_events_updated_at
BEFORE UPDATE ON public.life_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();