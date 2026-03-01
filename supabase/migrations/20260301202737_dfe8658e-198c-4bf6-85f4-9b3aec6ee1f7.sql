
-- Create sponsored_tools table
CREATE TABLE public.sponsored_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon_url TEXT,
  client_name TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT false,
  plan_type TEXT NOT NULL DEFAULT 'mensal',
  plan_start DATE,
  plan_end DATE,
  plan_value NUMERIC,
  display_order INTEGER NOT NULL DEFAULT 0,
  whatsapp_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsored_tools ENABLE ROW LEVEL SECURITY;

-- Public read for active tools
CREATE POLICY "Anyone can view active sponsored tools"
  ON public.sponsored_tools
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage sponsored tools"
  ON public.sponsored_tools
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_sponsored_tools_updated_at
  BEFORE UPDATE ON public.sponsored_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ads_updated_at();
