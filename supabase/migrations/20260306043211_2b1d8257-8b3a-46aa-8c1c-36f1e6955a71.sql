
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.admin_notifications;
CREATE POLICY "Anyone can create notifications"
  ON public.admin_notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
