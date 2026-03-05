
-- API usage tracking table
CREATE TABLE public.api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tool text NOT NULL,
  ip_address text,
  request_count integer NOT NULL DEFAULT 1,
  estimated_cost numeric NOT NULL DEFAULT 0
);

-- Allow public inserts (from edge functions via service role)
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on api_usage"
ON public.api_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can read api_usage"
ON public.api_usage FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Image rate limit table
CREATE TABLE public.image_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.image_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on image_rate_limits"
ON public.image_rate_limits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Site settings table for GA ID etc
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site_settings"
ON public.site_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default GA ID
INSERT INTO public.site_settings (key, value) VALUES ('google_analytics_id', 'G-EXQJBTV6EH');
