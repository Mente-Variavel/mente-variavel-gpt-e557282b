
-- Drop existing restrictive policies on ads
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can manage ads" ON public.ads;

-- Create permissive policies
CREATE POLICY "Public can view active ads"
  ON public.ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all ads"
  ON public.ads FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
