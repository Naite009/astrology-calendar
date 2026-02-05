-- Create chart_narratives table for storing generated narrative write-ups
CREATE TABLE public.chart_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  chart_id text NOT NULL,
  voice_preset text NOT NULL DEFAULT 'grounded_therapist',
  length_preset text NOT NULL DEFAULT 'full_800',
  include_shadow boolean NOT NULL DEFAULT true,
  engine_version text NOT NULL DEFAULT 'narrative_v1.0.0',
  narrative_text text NOT NULL,
  signals_json jsonb NOT NULL,
  source_map_json jsonb NOT NULL,
  device_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_narratives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow both authenticated users and anonymous device-based access)
CREATE POLICY "Users can view their own narratives"
ON public.chart_narratives
FOR SELECT
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

CREATE POLICY "Users can insert their own narratives"
ON public.chart_narratives
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can delete their own narratives"
ON public.chart_narratives
FOR DELETE
USING ((auth.uid() = user_id) OR ((auth.uid() IS NULL) AND true));

-- Create index for fast lookups
CREATE INDEX idx_chart_narratives_chart_id ON public.chart_narratives(chart_id);
CREATE INDEX idx_chart_narratives_device_id ON public.chart_narratives(device_id);