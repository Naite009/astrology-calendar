
-- Add columns for text extraction
ALTER TABLE public.astrology_documents 
  ADD COLUMN IF NOT EXISTS extracted_text text,
  ADD COLUMN IF NOT EXISTS extraction_status text DEFAULT 'pending';

-- Allow updates now (needed for extraction status + text)
CREATE POLICY "Users can update own documents"
  ON public.astrology_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Also allow service role updates via edge function (already covered by default)
