-- Create a profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to device_charts for authenticated users
ALTER TABLE public.device_charts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_device_charts_user_id ON public.device_charts(user_id);

-- Drop old permissive policies
DROP POLICY IF EXISTS "Devices can delete their own charts" ON public.device_charts;
DROP POLICY IF EXISTS "Devices can insert their own charts" ON public.device_charts;
DROP POLICY IF EXISTS "Devices can read their own charts" ON public.device_charts;
DROP POLICY IF EXISTS "Devices can update their own charts" ON public.device_charts;

-- New RLS policies that support both device-based (anonymous) and user-based access
CREATE POLICY "Users can read their own charts" ON public.device_charts
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (auth.uid() IS NULL AND true)  -- Allow anonymous device-based reads (handled in app)
  );

CREATE POLICY "Users can insert their own charts" ON public.device_charts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Users can update their own charts" ON public.device_charts
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (auth.uid() IS NULL AND true)
  );

CREATE POLICY "Users can delete their own charts" ON public.device_charts
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (auth.uid() IS NULL AND true)
  );

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();