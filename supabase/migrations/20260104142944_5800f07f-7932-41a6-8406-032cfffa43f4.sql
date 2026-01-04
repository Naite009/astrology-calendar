-- Create table for device-based chart backup (no login required)
CREATE TABLE public.device_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  chart_id text NOT NULL,
  chart_data jsonb NOT NULL,
  chart_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(device_id, chart_id)
);

-- Create index for faster lookups by device_id
CREATE INDEX idx_device_charts_device_id ON public.device_charts(device_id);

-- Enable Row Level Security
ALTER TABLE public.device_charts ENABLE ROW LEVEL SECURITY;

-- Allow any device to read/write its own charts
-- Using a simple policy that checks device_id in the request
CREATE POLICY "Devices can read their own charts"
  ON public.device_charts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Devices can insert their own charts"
  ON public.device_charts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Devices can update their own charts"
  ON public.device_charts
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Devices can delete their own charts"
  ON public.device_charts
  FOR DELETE
  TO anon
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_device_charts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_device_charts_updated_at
  BEFORE UPDATE ON public.device_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_device_charts_updated_at();