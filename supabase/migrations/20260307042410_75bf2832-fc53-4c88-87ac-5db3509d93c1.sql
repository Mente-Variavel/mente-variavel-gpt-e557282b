
CREATE TABLE public.visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  page text NOT NULL DEFAULT '/',
  user_agent text,
  city text,
  region text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor logs"
  ON public.visitor_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert visitor logs"
  ON public.visitor_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_visitor_logs_created_at ON public.visitor_logs (created_at DESC);
CREATE INDEX idx_visitor_logs_ip ON public.visitor_logs (ip_address);
