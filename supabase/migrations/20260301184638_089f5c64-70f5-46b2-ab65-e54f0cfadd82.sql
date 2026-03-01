
-- Tabela de anúncios editáveis
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot TEXT NOT NULL, -- 'banner_top', 'inline_1', 'inline_2', 'footer'
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Todos podem ler anúncios ativos (público)
CREATE POLICY "Anyone can view active ads"
ON public.ads FOR SELECT
USING (is_active = true);

-- Apenas usuários autenticados podem gerenciar (admin será controlado no frontend)
CREATE POLICY "Authenticated users can manage ads"
ON public.ads FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_ads_updated_at();

-- Inserir slots padrão
INSERT INTO public.ads (slot, title, description) VALUES
  ('banner_top', '', ''),
  ('inline_1', '', ''),
  ('inline_2', '', ''),
  ('footer', '', '');
