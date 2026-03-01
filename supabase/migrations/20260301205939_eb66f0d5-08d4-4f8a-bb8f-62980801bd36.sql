
-- Fix: Change restrictive policies to permissive for ads
DROP POLICY "Anyone can view active ads" ON public.ads;
DROP POLICY "Authenticated users can manage ads" ON public.ads;

CREATE POLICY "Anyone can view active ads" ON public.ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage ads" ON public.ads
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Same fix for sponsored_tools
DROP POLICY "Anyone can view active sponsored tools" ON public.sponsored_tools;
DROP POLICY "Authenticated users can manage sponsored tools" ON public.sponsored_tools;

CREATE POLICY "Anyone can view active sponsored tools" ON public.sponsored_tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage sponsored tools" ON public.sponsored_tools
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
