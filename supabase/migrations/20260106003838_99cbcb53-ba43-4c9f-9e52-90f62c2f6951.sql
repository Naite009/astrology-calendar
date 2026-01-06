-- Create storage bucket for astrology reference documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('astrology-docs', 'astrology-docs', false, 52428800);

-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'astrology-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'astrology-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'astrology-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a table to track uploaded documents with metadata
CREATE TABLE public.astrology_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT DEFAULT 'reference',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.astrology_documents ENABLE ROW LEVEL SECURITY;

-- Users can manage their own documents
CREATE POLICY "Users can view own documents"
ON public.astrology_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON public.astrology_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON public.astrology_documents FOR DELETE
USING (auth.uid() = user_id);