
-- Drop the restrictive policies
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
DROP POLICY IF EXISTS "Admins can manage all ads" ON public.ads;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Public can view active ads"
ON public.ads
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage all ads"
ON public.ads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
