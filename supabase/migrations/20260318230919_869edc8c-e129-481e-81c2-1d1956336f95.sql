INSERT INTO storage.buckets (id, name, public) VALUES ('cakes', 'cakes', true);

CREATE POLICY "Anyone can read cakes" ON storage.objects FOR SELECT USING (bucket_id = 'cakes');
