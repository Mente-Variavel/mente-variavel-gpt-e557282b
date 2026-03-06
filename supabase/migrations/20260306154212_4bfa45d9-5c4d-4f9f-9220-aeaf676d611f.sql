
CREATE TABLE public.subtitle_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subtitle_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subtitle_usage"
ON public.subtitle_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can read subtitle_usage"
ON public.subtitle_usage
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
