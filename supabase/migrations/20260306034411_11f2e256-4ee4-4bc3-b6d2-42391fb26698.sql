
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

CREATE POLICY "Admins can upload product videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-videos' AND public.has_role(auth.uid(), 'admin'));
